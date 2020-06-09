const CrownpeakApi = require("crownpeak-dxm-accessapi-helper");
const fs = require("fs");

const crownpeak = new CrownpeakApi();

let _config = process.env;
let _assetCache = {};

const init = (cfg) => {
    _config = cfg || process.env;
};

const login = async () => {
    //console.log(`Logging into ${_config.CMS_INSTANCE}`);
    return crownpeak.login(
        _config.CMS_USERNAME,
        _config.CMS_PASSWORD,
        _config.CMS_SERVER || "cms.crownpeak.net",
        _config.CMS_INSTANCE,
        _config.CMS_API_KEY
    );
};

const createFileFromModel = async (name, folderId, modelId) => {
    const request = new crownpeak.Asset.CreateRequest(name, folderId, modelId, 2, 0, 0, 0, 0);
    return crownpeak.Asset.create(request);
};

const createFile = async (name, folderId, templateId, workflowId) => {
    const request = new crownpeak.Asset.CreateRequest(name, folderId, 0, 2, templateId > 0 ? -1 : 1, templateId, workflowId, 0);
    return crownpeak.Asset.create(request);
};

const createOrUpdateDeveloperCsFile = async (name, folderId, workflowId, content) => {
    let path = await getPath(folderId);
    let result = await exists(path + name);
    let assetId = result.assetId;
    if (!result.exists) {
        // No asset exists, so create one
        assetId = (await createFile(name, folderId, 0, workflowId)).asset.id;
    }
    return update(assetId, content);
};

const createOrUpdateFile = async (name, folderId, modelId, content) => {
    let path = await getPath(folderId);
    let result = await exists(path + name);
    let assetId = result.assetId;
    if (!result.exists) {
        // No asset exists, so create one
        assetId = (await createFileFromModel(name, folderId, modelId)).asset.id;
    }
    return update(assetId, content);
};

const createFolder = async (name, folderId, modelId) => {
    if (modelId) return createFolderWithModel(name, folderId, modelId);
    const request = new crownpeak.Asset.CreateRequest(name, folderId, modelId, 4, 0, 0, 0, 0);
    return crownpeak.Asset.create(request);
};

const createFolderWithModel = async (name, folderId, modelId) => {
    const request = new crownpeak.Asset.CreateFolderWithModelRequest(name, folderId, modelId);
    return crownpeak.Asset.createFolderWithModel(request);
};

const download = async (id) => {
    const request = new crownpeak.Asset.DownloadPrepareRequest(id);
    return crownpeak.Asset.downloadAsBuffer(request);
};

const exists = async (idOrPath) => {
    return crownpeak.Asset.exists(idOrPath);
};

const get = async (idOrPath, bustCache) => {
    if (typeof idOrPath === "number" || parseInt(idOrPath)) return getById(idOrPath, bustCache);
    return getByPath(idOrPath, bustCache)
};

const getById = async (id, bustCache) => {
    if (!_assetCache[id] || bustCache === true) {
        _assetCache[id] = await crownpeak.Asset.read(id);
    }
    return _assetCache[id];
};

const getByPath = async (path, bustCache) => {
    if (!_assetCache[path] || bustCache === true) {
        const existsResult = await exists(path);
        if (!existsResult || !existsResult.exists) return null;
        _assetCache[path] = await crownpeak.Asset.read(existsResult.assetId);
        _assetCache[existsResult.id] = _assetCache[path];
    }
    return _assetCache[path];
};

const getPath = async (id) => {
    return (await get(id)).asset.fullPath;
};

const recompileLibrary = async (id) => {
    return crownpeak.Tools.recompileLibrary(id);
};

const update = async (id, content, deleteContent = []) => {
    const request = new crownpeak.Asset.UpdateRequest(id, content, deleteContent, true, true);
    return crownpeak.Asset.update(request);
};

const uploadBuffer = async (name, folderId, modelId, content, workflowId) => {
    let path = await getPath(folderId);
    let result = await exists(path + name);
    if (result.exists) {
        //console.log(`Found existing binary ${name} in folder ${folderId} with id ${result.assetId}`);
        // We replace a binary by passing its asset id as the folder id
        folderId = result.assetId;
    }
    const request = new crownpeak.Asset.UploadRequest(content, folderId, modelId, name, workflowId || 0);
    return crownpeak.Asset.upload(request);
};

const uploadFile = async (name, folderId, modelId, filePath, workflowId) => {
    const content = fs.readFileSync(filePath);
    return uploadBuffer(name, folderId, modelId, content.toString('base64'), workflowId);
};

/* Start: Convenience Methods */
const createOrUpdateComponent = async (className, markup, deferCompilation = false) => {
    const name = expandName(className, ' ');
    const folder = await getComponentDefinitionFolder();
    const model = await getComponentDefinitionModel();
    const content = {
        class_name: className,
        json_component: "yes",
        markup: markup
    };
    if (deferCompilation) content.defer_compilation = "yes";
    return createOrUpdateFile(name, folder.id, model.id, content);
};

const processComponents = async (components) => {
    for (let i in components) {
        const component = components[i];
        const result = await createOrUpdateComponent(component.name, component.content, true);
        component.assetId = result.asset.id;
        component.assetPath = await getPath(component.assetId);
        console.log(`Saved component [${component.name}] as [${component.assetPath}] (${component.assetId})`);
    }
    if (components.length > 0) {
        const libraryFolder = await getLibraryFolder();
        recompileLibrary(libraryFolder.id);
    }
    return components;
};

const createOrUpdateContentFolder = async (shortName) => {
    let name = expandName(shortName);
    const folderName = name + " Folder";
    name += "s"; // TODO: better way to make plural
    const siteRootPath = await getSiteRootPath();
    let folder = await getByPath(`${siteRootPath}/${name}`);
    if (!folder || !folder.asset) {
        // Doesn't exist, so we need to create a new one
        const modelsFolder = await getModelsFolder();
        let model = await getByPath(`${modelsFolder.fullPath}${folderName}`);
        if (!model || !model.asset) throw `Unable to find model folder [${folderName}]`;

        //console.log(`DEBUG: creating with model ${model.asset.id}`);
        folder = await createFolder(name, _config.CMS_SITE_ROOT, model.asset.id);
        if (!folder || !folder.asset) throw `Unable to create folder [${folderName}]`;
    }
    return folder.asset;
};

const createOrUpdateModel = async (shortName) => {
    const name = expandName(shortName);
    const folderName = name + " Folder";
    const modelsFolder = await getModelsFolder();
    let model = await getByPath(`${modelsFolder.fullPath}${folderName}/${name}`);
    if (!model || !model.asset) {
        // Check for the folder first
        let folder = await getByPath(`${modelsFolder.fullPath}${folderName}`);
        if (!folder || !folder.asset) {
            // Doesn't exist, so we need to create a new one
            folder = await createFolder(folderName, modelsFolder.id);
        }
        if (!folder || !folder.asset) throw `Unable to create model [${folderName}]`;
        // Now create a file
        const templateName = name + " Template";
        const templatesFolder = await getTemplatesFolder();
        const template = await getByPath(`${templatesFolder.fullPath}${templateName}`);
        if (!template || !template.asset) throw `Unable to find [${templateName}] folder`;
        const workflowId = await getWorkflowId();
        model = await createFile(name, folder.asset.id, template.asset.id, workflowId);
    }
    return model.asset;
};

const createOrUpdateTemplate = async (shortName, markup, shortWrapperName) => {
    const name = expandName(shortName, ' ') + " Template";
    const wrapperName = expandName(shortWrapperName, ' ') + " Wrapper";
    const folder = await getTemplateDefinitionFolder();
    const model = await getTemplateDefinitionModel();
    const templatesFolder = await getTemplatesFolder();
    const content = {
        create: "yes",
        json_template: "yes",
        markup: markup,
        template_folder: getInternalLink(templatesFolder),
        template_name: name,
        wrapper_type: "template_builder"
    };
    if (wrapperName) {
        const wrapperAsset = await getByPath((await getWrapperDefinitionFolder()).fullPath + wrapperName);
        if (wrapperAsset && wrapperAsset.asset) {
            content["upload#wrapper"] = getInternalLink(wrapperAsset.asset);
        }
    }
    return createOrUpdateFile(name, folder.id, model.id, content);
};

const processTemplates = async (templates, wrapperName) => {
    for (let i in templates) {
        const template = templates[i];
        let result = await createOrUpdateTemplate(template.name, template.content, template.wrapper || wrapperName);
        template.assetId = result.asset.id;
        template.assetPath = await getPath(template.assetId);
        console.log(`Saved template [${template.name}] as [${template.assetPath}] (${template.assetId})`);
        result = await createOrUpdateModel(template.name);
        if (!result.fullPath) {
            result.fullPath = await getPath(result.id);
        }
        console.log(`Saved model [${template.name}] as [${result.fullPath}] (${result.id})`);
        result = await createOrUpdateContentFolder(template.name);
        let assetPath = await getPath(result.id);
        console.log(`Saved content folder [${result.label}] as [${assetPath}] (${result.id})`);
    }
    return templates;
};

const createOrUpdateWrapper = async (shortName, headerMarkup, footerMarkup) => {
    const name = expandName(shortName, ' ') + " Wrapper";
    const folder = await getWrapperDefinitionFolder();
    const model = await getWrapperDefinitionModel();
    const templatesFolder = await getTemplatesFolder();
    const content = {
        config_asset_type: "coupled",
        create: "yes",
        header_markup: headerMarkup,
        footer_markup: footerMarkup,
        template_folder: getInternalLink(templatesFolder),
        template_name: name
    };
    return createOrUpdateFile(name, folder.id, model.id, content);
};

const processWrappers = async (wrappers) => {
    for (let i in wrappers) {
        const wrapper = wrappers[i];
        const result = await createOrUpdateWrapper(wrapper.name, wrapper.head, wrapper.foot);
        wrapper.assetId = result.asset.id;
        wrapper.assetPath = await getPath(wrapper.assetId);
        console.log(`Saved wrapper [${wrapper.name}] as [${wrapper.assetPath}] (${wrapper.assetId})`);
    }
    return wrappers;
};

const processUploads = async (uploads) => {
    const siteRootPath = await getSiteRootPath();
    for (let i = 0, len = uploads.length; i < len; i++) {
        let upload = uploads[i];
        if (!upload.content && !fs.existsSync(upload.source)) {
            console.warn(`Unable to find source file [${upload.source}] for upload`);
            continue;
        }
        const folder = await getByPath(`${siteRootPath}${upload.destination}`);
        if (!folder || !folder.asset) {
            console.error(`Unable to find folder [${siteRootPath}${upload.destination}] for upload`);
        } else {
            let uploadedFile;
            if (upload.content) {
                uploadedFile = await createOrUpdateDeveloperCsFile(upload.name, folder.asset.id, -1, { body: upload.content });
                if (!uploadedFile.asset.fullPath) {
                    uploadedFile.asset.fullPath = await getPath(uploadedFile.asset.id);
                }
        
            } else {
                uploadedFile = await uploadFile(upload.name, folder.asset.id, -1, upload.source, -1);
            }
            upload.assetId = uploadedFile.asset.id;
            upload.assetPath = uploadedFile.asset.fullPath;
        }
        console.log(`Uploaded [${upload.name}] as [${upload.assetPath}] (${upload.assetId})`);
    }
    return uploads;
};

const verifyEnvironment = async () => {
    await fatalTest(getSiteRootPath, "Unable to find Site Root");
    await fatalTest(getProjectPath, "Unable to find Project");
    await fatalTest(getLibraryFolder, "Unable to find 'Library' folder");
    await fatalTest(getComponentDefinitionFolder, "Unable to find 'Component Definitions' folder");
    await fatalTest(getTemplateDefinitionFolder, "Unable to find 'Template Definitions' folder");
    await fatalTest(getWrapperDefinitionFolder, "Unable to find 'Wrapper Definitions' folder");
    await fatalTest(getModelsFolder, "Unable to find 'Models' folder");
    await fatalTest(getTemplatesFolder, "Unable to find 'Templates' folder");
    await fatalTest(getComponentDefinitionModel, "Unable to find 'Enhanced Component' model");
    await fatalTest(getTemplateDefinitionModel, "Unable to find 'Enhanced Template' model");
    await fatalTest(getWrapperDefinitionModel, "Unable to find 'Wrapper' model");
    return true;
};

const fatalTest = async (fn, message, exitCode = 1) => {
    try {
        await fn();
    } catch (ex) {
        console.error(message);
        process.exit(exitCode);
    }
};

/* End: Convenience Methods */

/* Start: Internal Helpers */
const getSiteRootPath = async () => {
    let siteRootPath = _config.CMS_SITE_ROOT;
    if (parseInt(siteRootPath)) siteRootPath = await getPath(siteRootPath);
    if (siteRootPath.slice(-1) !== "/") siteRootPath += "/";
    return siteRootPath;
};

const getProjectPath = async () => {
    let projectPath = _config.CMS_PROJECT;
    if (parseInt(projectPath)) projectPath = await getPath(projectPath);
    if (projectPath.slice(-1) !== "/") projectPath += "/";
    return projectPath;
};

const getLibraryFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Library`);
    if (!result || !result.asset) throw "Unable to find 'Library' folder";
    return result.asset;
};

const getComponentDefinitionFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Component Library/Component Definitions`);
    if (!result || !result.asset) throw "Unable to find 'Component Definitions' folder";
    return result.asset;
};

const getTemplateDefinitionFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Component Library/Template Definitions`);
    if (!result || !result.asset) throw "Unable to find 'Template Definitions' folder";
    return result.asset;
};

const getWrapperDefinitionFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Component Library/Nav Wrapper Definitions`);
    if (!result || !result.asset) throw "Unable to find 'Nav Wrapper Definitions' folder";
    return result.asset;
};

const getModelsFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Models`);
    if (!result || !result.asset) throw "Unable to find 'Models' folder";
    return result.asset;
};

const getTemplatesFolder = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Templates`);
    if (!result || !result.asset) throw "Unable to find 'Templates' folder";
    return result.asset;
};

const getComponentDefinitionModel = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Models/Component Definition Folder/Enhanced Component`);
    if (!result || !result.asset) throw "Unable to find 'Enhanced Component' model";
    return result.asset;
};

const getTemplateDefinitionModel = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Models/Template Definition Folder/Enhanced Template`);
    if (!result || !result.asset) throw "Unable to find 'Enhanced Template' model";
    return result.asset;
};

const getWrapperDefinitionModel = async () => {
    const projectPath = await getProjectPath();
    const result = await get(`${projectPath}Models/Nav Wrapper Definition Folder/Wrapper`);
    if (!result || !result.asset) throw "Unable to find 'Wrapper' model";
    return result.asset;
};

const getWorkflowId = async () => {
    let workflow = _config.CMS_WORKFLOW || "0";
    if (parseInt(workflow) && parseInt(workflow).toString().length === workflow.length) return workflow;
    const workflows = (await crownpeak.Workflow.getList()).workflows;
    const keys = Object.keys(workflows);
    for (let key in keys)
    {
        const wf = workflows[keys[key]];
        if (wf.name === workflow) return wf.id;
    }
    console.warn(`Unable to find workflow ${workflow} - falling back to default`);
    return "0";
};

const getInternalLink = (idOrAsset) => {
    const cms = _config.CMS_INSTANCE;
    if (idOrAsset.id) idOrAsset = idOrAsset.id;
    return `/${cms}/cpt_internal/${idOrAsset}`;
};

const expandName = (shortName, sep = ' ') => {
    let result = [];
    for (let i = 0, len = shortName.length; i < len; i++) {
        const char = shortName[i];
        if (i === 0) {
            result.push(char.toString().toUpperCase());
        } else if (char >= 'A' && char <= 'Z' || char >= '0' && char <= '9') {
            result.push(sep);
            result.push(char);
        } else {
            result.push(char);
        }
    }
    return result.join("");
};

const compressName = (longName, seps = " _\t\r\n") => {
    let result = [];
    let onSep = true;
    for (let i = 0, len = longName.length; i < len; i++) {
        const char = longName[i];
        if (seps.indexOf(char) >= 0) {
            onSep = true;
        } else if (onSep) {
            result.push(char.toString().toUpperCase());
            onSep = false;
        } else {
            result.push(char.toString().toLowerCase());
        }
    }
    return result.join("");
};
/* End: Internal Helpers */

module.exports = {
    init: init,
    login: login,
    createFile: createFileFromModel,
    createFolder: createFolder,
    download: download,
    exists: exists,
    get: get,
    getPath: getPath,
    save: createOrUpdateFile,
    update: update,
    uploadBuffer: uploadBuffer,
    uploadFile: uploadFile,
    expandName: expandName,
    compressName: compressName,

    saveComponent: createOrUpdateComponent,
    saveComponents: processComponents,
    saveModel: createOrUpdateModel,
    saveTemplate: createOrUpdateTemplate,
    saveTemplates: processTemplates,
    saveWrapper: createOrUpdateWrapper,
    saveWrappers: processWrappers,
    saveUploads: processUploads,
    verifyEnvironment: verifyEnvironment
};