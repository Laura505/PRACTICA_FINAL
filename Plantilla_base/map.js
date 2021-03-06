    var map;
    var tb;
        require(["esri/map",
            "esri/geometry/Extent" ,
            "esri/layers/ArcGISDynamicMapServiceLayer",

            "esri/dijit/BasemapGallery", 
            "esri/dijit/Scalebar",
            "esri/dijit/Legend",
            "esri/dijit/Search",
            "esri/dijit/OverviewMap", 

            "esri/layers/FeatureLayer",
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

            "dojo/on",
            "dojo/dom",

            "dijit/TitlePane",
            "dijit/layout/TabContainer",
            "dijit/layout/ContentPane",
            "dijit/layout/BorderContainer",
            "dojo/domReady!"],
            function(
            Map, Extent, ArcGISDynamicMapServiceLayer, BasemapGallery, Scalebar, Legend, Search, OverviewMap, FeatureLayer, Draw, Graphic, graphicsUtils, Query, Popup, PopupTemplate, InfoTemplate, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, 
            on, dom,

            ) {


        
        

        
        
        
        //empiezo

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
        var Ciudades = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0");
        
        var states = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", {
          infoTemplate: popupStates, //llama la ventana emergente
          outFields:["*"] //llama a todos los campos de la capa
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

        //COPIO
        on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
        

        //selección Ciudades
        function fPintaYQuery(){
            var tbDraw = new Draw(map);
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

            //simbolo seleccion
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
            Ciudades.on("selection-complete",populateGrid);
            Ciudades.selectFeatures(queryCities,FeatureLayer.SELECTION_NEW);
          }        
        function populateGrid(results) {               
            var gridData;
            dataCities = array.map(results.features, function (feature) {
               return {"st": feature.attributes[outFieldsCities[0]],
                        "areaname": feature.attributes[outFieldsCities[1]],
                        "pop2000": feature.attributes[outFieldsCities[2]],
                      }
             });
            var memStore = new Memory({
              data: dataCities
            });
            gridCities.set("store", memStore);
            
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


      });
