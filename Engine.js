/**
 * @author: @__Guillaume
 * 
 * Mapper engine - Process an angularJS file 
 */
import * as Parser from "@babel/core";
import traverse from '@babel/traverse';

const _appGraph = {
    nodes:[],
    nodesMap:{},
    apis:[],
}


const ngMethods= [
    "constant",
    "controller",
    "directive",
    "component",
    "factory",
    "filter",
    "provider",
    "service",
    "value",
    "run",
    "config",
    "module",
  ];

const _angular = {};
export default class Engine{

init(){
    this.angular = {
        
    };
    this._appGraph = {
        nodes:[],
        nodesMap:{},
        apis:[],
    };
    this._lookupList = [];
    this._cplxiT = [];
}
analyzeFile(jsContent, id){
    const result = {
        exportedAs:undefined,
        imports:[],
        angular:undefined,
        
    }
    const counters = {
        variables:0,
        functions:0,
        loops:0
    }
    let _ast
    try{
        _ast = Parser.parse(jsContent, {
        sourceType: "module",
        plugins: ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-proposal-class-properties"],
    });
    }catch(e){
        return {
            error:e
        }
    }

    if(!_ast){
        return {
            unparseable:true
        }
    }
    const filename = id.substr(id.lastIndexOf('/')+1);
    let _nodes =[];
    let moduleName;
    let imports = [];
    traverse(_ast, {
        enter : (path)=>{
            if (path.node.type === 'ImportDeclaration') {
            imports.push(path.node.source.value);
            }
            if (path.node.type === 'ExportNamedDeclaration') {
                if(path.node.specifiers && path.node.specifiers.length > 0){
                    result.exportedAs = path.node.specifiers[0].exported.name;
                }
            }
            if (path.node.type === 'ForStatement') {
                counters.loops++;
                }
        },
        VariableDeclaration : path =>{
            counters.variables++;
        },
        FunctionDeclaration : path => {
            counters.functions++;
        },
        MemberExpression : (path) =>{
            if(path.node.property && path.node.property.type === 'Identifier' && path.node.property.name === 'forEach' ){
                counters.loops++; 
            }
        },
        CallExpression : (path) => {
            const _rootNode =path.node;
            const firstStage =  _rootNode.callee;
            if(firstStage.type === 'MemberExpression' && ngMethods.includes(firstStage.property.name) && this.isCalledForAngular(path.node.callee)){

                if(firstStage.property.name === 'module'){
                    moduleName = this.getNameFromArguments(_rootNode.arguments);
                }
                else{
                    let _tmpName = this.getNameFromArguments(_rootNode.arguments) || `${firstStage.property.name}__${filename}`;
                    let _node = this.getNodeFromName(_tmpName)
                    let _deps = [];
                    _node.type = firstStage.property.name;
                    _node.isAngular = true; 
                    _node.name = _tmpName;
                    _node.path = id;
                    _node.filename = filename;
                    _node.moduleName = this.getModuleName(path.node.callee);
                    _deps = this.findDeclarationDeps(this.findMethodNameFromArguments(_rootNode.arguments), _ast);
                    _deps.forEach(aDep => {
                        _node.ngDeps.push(this.getNodeFromName(aDep).name); 
                     });
                     this._lookupList.push({name:_tmpName, id:_node.id, path:id, type:_node.type}); 
                }
                
            
            }
            else return;
            
                
            
           
        }
       
    })
    


   
    //Shitty analyse
    this._cplxiT.push({id, counters, imports}); 

    /*

    try{
        const analyse = escomplex.analyse(jsContent);
        this._cplxiT.push({id, analyse});
        
    }catch(err){
        console.log(id);
       // console.log(err);
    }*/

    return result;
}

isCalledForAngular(node){
    if(node.object && node.object.type === 'CallExpression'){
        return this.isCalledForAngular(node.object.callee);
    }
    if(node.object && node.object.type === 'Identifier' && node.object.name === 'angular'){
        return true;
    }
     return false;
}

getModuleName(node, modulename){
    if(node.property && node.property.type === 'Identifier' && node.property.name === 'module'){
        return modulename;
    }
    if(node.object && node.object.type === 'CallExpression'){
        if(node.object.arguments && node.object.arguments.length>0
            && node.object.arguments[0].type === 'StringLiteral'
            ){
                modulename = node.object.arguments[0].value; 
        }
        return this.getModuleName(node.object.callee, modulename);
    }
   return; 
}

getNameFromArguments(args){
    for(let i=0; i<args.length; i++){
       if(args[i].type === 'StringLiteral'){
           return args[i].value;
       }
    }
    return;
}

findMethodNameFromArguments(args){
    for(let i=0; i<args.length; i++){
        if(args[i].type === 'Identifier'){
            return args[i].name;
        }
     }
     return;
    }

findDeclarationDeps(name, ast){
    const deps = [];
    traverse(ast,{
        FunctionDeclaration : (path) =>{
            if(path.node.id.type === 'Identifier' && path.node.id.name === name){
                path.node.params.forEach(element => {
                    if(element.type === 'Identifier') deps.push(element.name);
                });
            }
        }
    });

    return deps;
}

getNodeFromName(name){
    if(!this._appGraph.nodesMap[name]){
        this._appGraph.nodesMap[name] = {
            id:`${Date.now()}${(Math.random()*10000>>0)}`,
            name,
            type:undefined,
            path:undefined,
            moduleName:undefined,
            ngDeps : []
        }
    }
    return this._appGraph.nodesMap[name];
}



getAngular(){
    return this.angular;
}

getGraph(){
    return this._appGraph;
}

getLookupList(){
    return this._lookupList;
}

getAnalyse(){
    return this._cplxiT;
}

}