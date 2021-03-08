    var map;
    var tbDraw;
        require(["esri/map",
            "esri/geometry/Extent" ,
            "esri/layers/ArcGISDynamicMapServiceLayer",

            "esri/dijit/BasemapGallery", 
            "esri/dijit/Scalebar",
            "esri/dijit/Legend",
            "esri/dijit/Search",
            "esri/dijit/OverviewMap", 

            "esri/layers/FeatureLayer",
            "esri/dijit/FeatureTable",
            "esri/toolbars/draw" ,
            "esri/graphic" ,
            "esri/graphicsUtils",
            "esri/tasks/query",

            "esri/dijit/Popup",
            "esri/dijit/PopupTemplate",
            "esri/InfoTemplate",

            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/Color",

            "dojo/ready",
            "dojo/parser",
            "dojo/on",
            "dojo/dom",   

            "dojo/_base/Color",                             
            "dojo/_base/declare",
            "dojo/_base/array",                             
    
            "dgrid/OnDemandGrid",
            "dgrid/Selection",

            "dijit/TitlePane",
            "dijit/layout/TabContainer",
            "dijit/layout/ContentPane",
            "dijit/layout/BorderContainer",
            "dojo/domReady!"],
            function(
            Map, Extent, ArcGISDynamicMapServiceLayer, BasemapGallery, Scalebar, Legend, Search, OverviewMap, FeatureLayer, FeatureTable, Draw, Graphic, graphicsUtils, Query, Popup, PopupTemplate, InfoTemplate, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, ready, parser, 
            on, dom, Color, declare, array,
            Grid, Selection,

            ) {

        //SELECCIONAR CIUDADES
        on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
        

        //selección Ciudades
        function fPintaYQuery(){
            tbDraw = new Draw(map);
            tbDraw.on("draw-complete",displayPolygon);
            tbDraw.activate(Draw.POLYGON);
          }
          
        function displayPolygon(evt) {
            var geometryInput = evt.geometry;
            var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));
            
            //borrar poligonos
            map.graphics.clear();

            //añadir capa grafica al mapa
            var graphicPolygon = new Graphic(geometryInput, tbDrawSymbol);
            map.graphics.add(graphicPolygon);
            selectCities(geometryInput);
          }      

            //Simbolo seleccion de Ciudades
        function selectCities(geometryInput) {
            var symbolSelected = new SimpleMarkerSymbol({
              "type": "esriSMS",
              "style": "esriSMSCircle",
              "color": [255, 0, 0, 128],
              "size": 8,
              "outline": {"color": [255, 225, 0, 214],
                      "width": 1}
            });
            Ciudades.setSelectionSymbol(symbolSelected);
            
            //selección segun area
            var queryCities = new Query();
            queryCities.geometry = geometryInput;
            //
            Ciudades.on("selection-complete");
            Ciudades.selectFeatures(queryCities,FeatureLayer.SELECTION_NEW, function(features){
              TablaCities.filterSelectRecords()

            });
          }        
        
          on(dojo.byId("OffpintaYQuery"),"click", OffpintaYQuery);
          function OffpintaYQuery(){
            map.graphics.clear();
            Ciudades.clearSelection()
            map.setExtent(Extent)
          };
          on(dojo.byId("OffpintaYQuery"),"click",offCities);
    
          function offCities (){
            Ciudades.clearSelection();
            map.graphics.clear();
            TablaCities.clearFilter()
            tbDraw.deactivate()
          }
        
          

        

        // Boton "Ir al Estado"
        on(dojo.byId("progButtonNode"), "click",function (){
            
         
          var inputState = dojo.byId("dtb").value; 
          
          //Simbologia del estado 
          var sbState = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
            new Color([255,0,0]), 2),new Color([255,255,0,0.5])
          );
          
          //asignamos simbologia
          states.setSelectionSymbol(sbState);
          
          //Consulta
          var queryState = new Query();
          queryState.where = `state_name = '${inputState}'`; 
          
          states.selectFeatures(queryState, FeatureLayer.SELECTION_NEW, function (selection){
            // Zoom al estado seleccionado
            var centerSt = graphicsUtils.graphicsExtent(selection).getCenter();
            var extentSt = esri.graphicsExtent(selection);
            
            map.setExtent(extentSt.getExtent().expand(2));
            map.centerAt(centerSt);
          });
        
          
        });
        

        
        
        
        //extensión

        var Extent = new Extent({
          
            "xmin":-14098190.379427297,
            "ymin":3574466.237619665,
            "xmax":-10272669.987811813,
            "ymax":6069370.840847155,
            "spatialReference" : {
              "wkid" : 102100
            }
        });

        
        map = new Map("map", {
          basemap: "topo",
          extent: Extent,
        });

        //Popup Estados
          var popupStates = new PopupTemplate ({
            title: "Estado de {state_name}, {state_abbr}",
            fieldInfos: [{
              fieldName: "pop2000",
              label: "Población:",
              visible: true
            }, {
              fieldName: "pop00_sqmi",
              label: "Población por sqmi:",
              visible: true
            }, {
              fieldName: "ss6.gdb.States.area",
              label: "Area en sqmi:",
              visible: true,
              format: {places: 0}
            }]
          });
          map.on("zoom",function(evt){
            popup.hide()
          });

        //Añado los mapas de USA
      
        var lyrUSA = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer", {
            opacity : 0.5
        });
        var Ciudades = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0", {
          outFields:["st", "areaname","class", "pop2000"],
        });
        
        var states = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", {
          infoTemplate: popupStates, 
          outFields:["state_name", "state_abbr", "pop2000", "pop00_sqmi", "ss6.gdb.States.area"] 
        });
        
        map.on("load",function(evt){
            map.addLayer (lyrUSA) ;
            map.addLayer (Ciudades) ;
            map.resize();
            map.reposition();

        });
        //Añado el widget BasemapGallery
        var basemapGallery = new BasemapGallery ({
            map : map,
            basemap : "topo"
          }, "BasemapGallery");
          basemapGallery.startup();

        //Añado escala
        var digitScalebar = new Scalebar({
            map : map,
            scalebarUnit : "dual",
            attachTo : "bottom-left"
        });

        //Añado leyenda
        var digitLegend = new Legend({
            map : map,
            arrangement : Legend.ALIGN_RIGHT
        },"legendDiv") ;
        digitLegend.startup() ;

        //Añado buscar
        var dijitSearch = new Search ({
            map : map,
            autoComplete : true
        }, "divSearch");
        dijitSearch.startup ();

        // Añadir Visor general
        var OverviewMap = new OverviewMap ({
            map: map,
            attachTo: "bottom-right",
            visible: true
          }, "VGeneral");
          OverviewMap.startup();

        Ciudades.on("load", function(){
          TablaCities =  new FeatureTable({
            featureLayer : Ciudades,
            map : map,
            outFields:["st", "areaname","class", "pop2000"],
            syncSelection: true,
            zoomToSelection:true,
            fieldInfos: [
              {
                name: 'st',
                alias: 'Estado'
              },
              {
                name: 'areaname',
                alias: 'Ciudad'
              },{
                name: 'class',
                alias: 'Clase'
              },{
                name: 'pop2000',
                alias: 'Habitantes'
              }],
            }, "TableNode");
            
            TablaCities.startup();
          })   
        

        


      });
