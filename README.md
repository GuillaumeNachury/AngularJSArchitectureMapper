# AngularJSArchitectureMapper
Analyse your AngularJS project and create a dependency graph.

## usage
clone this repo, and modify the `config.json` file with the path to the project you want to analyse.

Get the dependencies
`yarn`

Run
`yarn start`

It will generate several files into the `output` directory.
* `angular.json` : the main depndency graph.
* `lookup.json` : a convenient source of data that will be used to search for files / component in the viewer : [AngularJS Architecture Explorer](https://github.com/GuillaumeNachury/AngularJSArchitectureExplorer).

