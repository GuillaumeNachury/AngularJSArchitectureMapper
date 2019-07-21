# AngularJS Architecture Mapper
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

## Visualize dependencies
Once you run `AngularJSArchitectureMapper` and got the ouput generated, just serve the `outup` folder content thru an http server and use the [AngularJS Architecture Explorer](https://github.com/GuillaumeNachury/AngularJSArchitectureExplorer)

<p align="center">
  <img width="600" src="https://github.com/GuillaumeNachury/AngularJSArchitectureExplorer/raw/master/__snapshots/explore.png">
</p> 
