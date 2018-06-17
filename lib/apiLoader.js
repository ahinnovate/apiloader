(function(){

    let _ = require("lodash");

    let getMethod = require("../../../../nodedb/config/getGlobalMethod");

    let methodName = getMethod.FileName;

    module.exports = function(router , route){

        for(let i = 0; i < route.length; i++){
            router[route[i].method](route[i].path, async (ctx, next) => {
                let incomingUrl = ctx.url;
                for(let key in ctx.params){
                    incomingUrl = incomingUrl.replace(ctx.params[key], ":" + key);
                }
                let routeConfig = _.find(route , {path: incomingUrl});
                let moduler = getMethod(methodName[routeConfig.module]);
                let responseHandler = getMethod(methodName.responseHandler);

                ctx.tnxId = ctx.header["x-request-id"] || "";
                ctx.utils = getMethod(methodName.utils);
                ctx.config.tnxId = ctx.tnxId;

                let upgradedConsole = getMethod(methodName.consoleUpgrade);
                upgradedConsole(ctx, ctx.config);

                let commandObj = { "body": ctx.request.body, "params": ctx.params, "serviceFrom": ctx.header["x-service-from"] || "", "tnxId": ctx.tnxId, "utils": ctx.utils, "config": ctx.config, "io": ctx.io || {}, "callSessionCreate": ctx.callSessionCreate , "callSessionUpdate" : ctx.callSessionUpdate , "callSessionRemove" : ctx.callSessionRemove , "addToSession" : ctx.addToSession , "removeSession" : ctx.removeSession , "checkSession": ctx.checkSession };
                commandObj.paginateOptions = getMethod(methodName.paginate)(ctx);

                let result = await moduler[routeConfig.handler](commandObj);
                await responseHandler.sendResponse(ctx, result);
            });
        }
    };
})();