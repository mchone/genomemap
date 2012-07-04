function GenomeMaps(targetId,args){
	var _this=this;
	this.id = "GenomeMaps"+ Math.round(Math.random()*10000);
	this.suiteId = 9;
	this.title="Genome Maps";
	this.description="RC";
	this.wum=true;
	this.version="2.0.0";

	this.args = args;
	
	this.width =  $(window).width();
	this.height = $(window).height();
	this.targetId = document.body;
	
	if (targetId != null){
		this.targetId=targetId;
	}
//	if (args != null){
//		if(args.wum != null){
//			this.wum = args.wum;
//		}
//	}
	
	if (args != null){
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.wum != null) {
			this.wum = args.wum;
		}
	}
	
	//Parse query params to get location.... Also in AVAILABLE_SPECIES, an example location is set.
	var url = $.url();
	var location = url.param('location');
	if(location != null) {
		var position = location.split(":")[1];
		var chromosome = location.split(":")[0];
	}
	
//	console.log(Ext.ComponentManager.each(function(a){console.log(a);}));
//	console.log(Ext.ComponentManager.getCount());
	
//	if (this.wum==true){
	this.headerWidget = new HeaderWidget({
		appname: this.title,
		description: this.description,
		version:this.version,
		suiteId : this.suiteId
	});
	

//	if($.cookie("gm_settings")){
//		var species = JSON.parse($.cookie("gm_settings")).species;
//	}else{
//		var species = AVAILABLE_SPECIES[0];
//	}
	
	this.genomeViewer = new GenomeViewer(this.id+"gvDiv", AVAILABLE_SPECIES[0],{
		position:position,
		chromosome:chromosome,
		toolbar:this.getMenuBar(),
		version:this.version,
		availableSpecies: AVAILABLE_SPECIES,
		height:this.height-this.headerWidget.height,
		width:this.width
	});
	
	/**Atach events i listen**/
	this.headerWidget.onLogin.addEventListener(function (sender){
		Ext.example.msg('Welcome', 'You logged in');
	});
	
	this.headerWidget.onLogout.addEventListener(function (sender){
		Ext.example.msg('Good bye', 'You logged out');
	});
//	}
	
	//SPECIE EVENT
	this.genomeViewer.onSpeciesChange.addEventListener(function(sender,data){
//		_this.draw();
//		console.log("*CAMBIAMOS LA ESPECIE")
		_this._setTracks();
		_this.setTracksMenu();
	});
	//Events i listen
	this.genomeViewer.onLocationChange.addEventListener(function(sender,data){
		_this.headerWidget.setDescription(_this.genomeViewer.speciesName);
	});
	
	//RESIZE EVENT
	$(window).smartresize(function(a){
		_this.setSize($(window).width(),$(window).height());
	});
	
	//SAVE CONFIG IN COOKIE
	$(window).unload(function(){
		var value = {
				species:{
					name:_this.genomeViewer.speciesName,
					species:_this.genomeViewer.species,
					chromosome:_this.genomeViewer.chromosome,
					position:_this.genomeViewer.position}
		};
		
		$.cookie("gm_settings", JSON.stringify(value), {expires: 365});
	});
};



GenomeMaps.prototype.draw = function(){
	var _this = this;
	if(this._panel==null){
		
		var gvContainer = Ext.create('Ext.container.Container', {
			id:this.id+"gvContainer",
			html : '<div id="'+this.id+'gvDiv"></div>'
		});
		
		this._panel = Ext.create('Ext.panel.Panel', {
			id:this.id+"_panel",
			renderTo:this.targetId,
//			renderTo:Ext.getBody(),
//		layout: { type: 'vbox',align: 'stretch'},
			border:false,
			width:this.width,
			height:this.height,
			items:[this.headerWidget.getPanel(),gvContainer]
		});
	}
	
	this.headerWidget.setDescription(this.genomeViewer.speciesName);
	$("#"+this.headerWidget.id+"appTextItem").qtip({
		content: '<span class="info">'+this.version+'</span>',
		position: {my:"bottom center",at:"top center",adjust: { y: 0, x:-25 }}
		
	});
	
	
	this.genomeViewer.afterRender.addEventListener(function(sender,event){
		Ext.getCmp(_this.genomeViewer.id+"versionLabel").setText('<span class="info">'+_this.version+'</span>');
		var geneTrack = new TrackData("gene",{
			adapter: new CellBaseAdapter({
				category: "genomic",
				subCategory: "region",
				resource: "gene",
				species: _this.genomeViewer.species,
				featureCache:{
					gzip: true,
					chunkSize:50000
				}
			})
		});
		_this.genomeViewer.trackSvgLayout2.addTrack(geneTrack,{
			id:"gene",
			type:"gene",
			featuresRender:"MultiFeatureRender",
			histogramZoom:20,
			height:150,
			visibleRange:{start:0,end:100},
			titleVisibility:'hidden',
			featureTypes:FEATURE_TYPES
		});
		_this._setTracks();
	});
	this.setTracksMenu();
//	this.setDASMenu();
	this.setPluginsMenu();
	this.genomeViewer.draw();
};


GenomeMaps.prototype.setSize = function(width,height){
	if(width<500){width=500;}
	if(width>2400){width=2400;}//if bigger does not work TODO why?
	
	this.width=width;
	this.height=height;
	
	this._panel.setSize(width,height);
	this.genomeViewer.setSize(width,height-this.headerWidget.height);
	this.headerWidget.setWidth(width);
};


GenomeMaps.prototype._setTracks= function(){
//	var seqtrack = new TrackData("sequence",{
//		adapter: new CellBaseAdapter({
//			category: "genomic",
//			subCategory: "region",
//			resource: "sequence",
//			species: this.genomeViewer.species,
//			featureCache:{
//				gzip: true,
//				chunkSize:1000
//			}
//		})
//	});
//	this.genomeViewer.trackSvgLayout.addTrack(seqtrack,{
//		id:"sequence",
//		type:"sequence",
//		featuresRender:"SequenceRender",
////		histogramZoom:"",
//		height:50,
//		visibleRange:{start:100,end:100},
//		settings:{
//			color: {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"},
//			closable: false
//		}
//	});

	
//	var geneTrack = new TrackData("gene",{
//		adapter: new CellBaseAdapter({
//			category: "genomic",
//			subCategory: "region",
//			resource: "gene",
//			species: this.genomeViewer.species,
//			featureCache:{
//				gzip: true,
//				chunkSize:50000
//			}
//		})
//	});
//	this.genomeViewer.trackSvgLayout.addTrack(geneTrack,{
//		id:"gene",
//		type:"gene",
//		histogramRender:null,
//		featuresRender:"MultiFeatureRender",
//		histogramZoom:20,
//		transcriptZoom:50,
//		height:24,
//		visibleRange:{start:0,end:100},
//		featureTypes:FEATURE_TYPES
//	});

	
//	var snpTrack = new TrackData("snp",{
//		adapter: new CellBaseAdapter({
//			category: "genomic",
//			subCategory: "region",
//			resource: "snp",
//			species: this.genomeViewer.species,
//			featureCache:{
//				gzip: true,
//				chunkSize:10000
//			}
//		})
//	});
//	this.genomeViewer.trackSvgLayout.addTrack(snpTrack,{
//		id:"snp",
//		type:"snp",
//		histogramRender:null,
//		featuresRender:"MultiFeatureRender",
//		histogramZoom:80,
//		height:150,
//		visibleRange:{start:0,end:100},
//		settings:{
//			label: "name",
//			infoWidgetId: "name",
//			colorField: "displaySoConsequence",
//			height:10,
//			histogramColor:"orange",
//			color: SNP_BIOTYPE_COLORS
//		}
//	});

//	var vcfTrack = new TrackData("vcf",{
//		adapter: new VCFDataAdapter(new UrlDataSource("http://rsanchez/example.vcf"),{
//			async: false,
//			gzip: false
//		})
//	});
//	this.genomeViewer.trackSvgLayout.addTrack(vcfTrack,{
//		id:"vcf",
//		type:"vcf",
//		featuresRender:"MultiFeatureRender",
////		histogramZoom:"",
//		height:50,
//		visibleRange:{start:0,end:100},
//		featureTypes:FEATURE_TYPES
//	});
	
	
//	
//	
//	var vcfTrack = new TrackData("vcf",{
//		adapter: new VCFDataAdapter(new UrlDataSource("http://rsanchez/example.vcf"),{
//			async: false,
//			gzip: true
//		})
//	});
//	_this.trackSvgLayout.addTrack(vcfTrack,{
//		id:"vcf",
//		type:"vcf",
//		histogramRender:null,
//		featuresRender:"MultiFeatureRender",
//		histogramZoom:"",
//		height:50,
//		visibleRange:{start:0,end:100}
//	});
	
//	var track3 = new TrackData("gff",{
//		adapter: new GFFDataAdapter(new UrlDataSource("http://rsanchez/example.gff"),{
//			async: false,
//			gzip: true
//		})
//	});
//	_this.trackSvgLayout.addTrack(track3,{id:"gff",type:"gff"});

//		var track4 = new TrackData("bed",{
//			adapter: new BEDDataAdapter(new UrlDataSource("http://bioinfo.cipf.es/apps-beta/examples/example.bed"),{
//				async: false,
//				gzip: false
//			})
//		});
//		_this.trackSvgLayout.addTrack(track4,{id:"bed",type:"bed"});
	
//		// load vcf file from file widget
//		var vcf = new VCFFileWidget({viewer:this});
//		vcf.onComplete.addEventListener(function(sender, data){
//			vcf.onOk.addEventListener(function(sender){
//				_this.trackSvgLayout.addTrack(data,{id:"vcf",type:"vcf",render:""/*GeneRender*/});
//			});
//		});
//		vcf.draw();
	
//		this.trackSvgLayout.addTrack(track3,{id:"vcf",type:"snp",render:""/*GeneRender*/});
	
	
	//track3.adapter.onLoad.addEventListener(function(sender){
		//_this.trackSvgLayout.addTrack(track3,{id:"vcf",type:"snp",render:""/*GeneRender*/});
	//});
	
	
	// _this.trackSvgLayout.addTrack({id:"gene",resource:"gene"});
	//_this.trackSvgLayout.addTrack({id:"snp",resource:"snp"});
	
	//setTimeout(function() {
		//_this.trackSvgLayout.addTrack({id:"track4"});
	//},5000);
	
	
	
	
	
	//Load initial TRACKS config
	var _this = this;
	var species = this.genomeViewer.species;
	var categories = TRACKS[SPECIES_TRACKS_GROUP[species]];
	
	for (var i=0, leni=categories.length; i<leni; i++) {
		var sources = [];
		for ( var j = 0, lenj=categories[i].tracks.length; j<lenj; j++){
			var id = categories[i].tracks[j].id;
			var checked = categories[i].tracks[j].checked;
			var disabled = categories[i].tracks[j].disabled;
			
			if(checked && !disabled && !this.genomeViewer.checkRenderedTrack(id)){
				this.addTrack(id);
			}else if((!checked || disabled) && this.genomeViewer.checkRenderedTrack(id)){
				this.genomeViewer.removeTrack(id);
			}
		}
	}
	
	//Load initial DAS_TRACKS config
	var das_tracks = DAS_TRACKS;
	for (var i = 0, leni = das_tracks.length; i < leni; i++) {
		if(das_tracks[i].species == species){
			for ( var j = 0, lenj = das_tracks[i].categories.length; j < lenj; j++){
				var sourceName, sourceUrl, checked;
				for ( var k = 0, lenk = das_tracks[i].categories[j].sources.length; k < lenk; k++){
					sourceName = das_tracks[i].categories[j].sources[k].name;
					sourceUrl = das_tracks[i].categories[j].sources[k].url;
					checked = das_tracks[i].categories[j].sources[k].checked;
					
					if(checked){
						this.addDASTrack(sourceName, sourceUrl);
					}
				}
			}
			break;
		}
	}

};


GenomeMaps.prototype.addTrack = function(trackId) {
	console.log(trackId);
	switch (trackId) {
	case "Gene/Transcript":
		var geneTrack = new TrackData(trackId,{
			adapter: new CellBaseAdapter({
				category: "genomic",
				subCategory: "region",
				resource: "gene",
				species: this.genomeViewer.species,
				featureCache:{
					gzip: true,
					chunkSize:50000
				}
			})
		});
		this.genomeViewer.addTrack(geneTrack,{
			id:trackId,
			featuresRender:"MultiFeatureRender",
			histogramZoom:20,
			transcriptZoom:50,
			height:24,
			visibleRange:{start:0,end:100},
			featureTypes:FEATURE_TYPES
		});
		break;
	case "Cytoband":
		
		break;
	case "Sequence":
		var seqtrack = new TrackData(trackId,{
			adapter: new CellBaseAdapter({
				category: "genomic",
				subCategory: "region",
				resource: "sequence",
				species: this.genomeViewer.species,
				featureCache:{
					gzip: true,
					chunkSize:1000
				}
			})
		});
		this.genomeViewer.addTrack(seqtrack,{
			id:trackId,
			featuresRender:"SequenceRender",
			height:50,
			visibleRange:{start:100,end:100},
			closable: false
		});
		break;
	case "CpG islands":
		
		break;
	case "SNP":
		var snpTrack = new TrackData(trackId,{
			adapter: new CellBaseAdapter({
				category: "genomic",
				subCategory: "region",
				resource: "snp",
				species: this.genomeViewer.species,
				featureCache:{
					gzip: true,
					chunkSize:10000
				}
			})
		});
		this.genomeViewer.addTrack(snpTrack,{
			id:trackId,
			featuresRender:"MultiFeatureRender",
			histogramZoom:80,
			height:150,
			visibleRange:{start:0,end:100},
			featureTypes:FEATURE_TYPES
		});
		break;
	case "Mutation":
		
		break;
	case "Structural variation":
		
		break;
	case "miRNA targets":
		
		break;
	case "TFBS":
		
		break;
	case "Histone":
		
		break;
	case "Polymerase":
		
		break;
	case "Open Chromatin":
		
		break;
	case "Conserved regions":
		
		break;

	default:
		break;
	}
};

GenomeMaps.prototype.addDASTrack = function(sourceName, sourceUrl) {
	var dasTrack = new TrackData("das",{
		adapter: new DasAdapter({
			url: sourceUrl,
			species: this.genomeViewer.species,
			featureCache:{
				gzip: false,
				chunkSize:10000
			}
		})
	});
	this.genomeViewer.addTrack(dasTrack,{
		id:sourceName,
		type:"das",
		featuresRender:"MultiFeatureRender",
//		histogramZoom:80,
		height:150,
		visibleRange:{start:0,end:100},
		settings:{
			height:10
		}
	});
};


//App interface, Main menu ...  and others menus
GenomeMaps.prototype.getMenuBar = function() {
	var _this = this;
	var fileMenu = Ext.create('Ext.menu.Menu', {
		
		items : [
//		    {
//				text : 'New',
//				handler : function() {
//					console.log("Not yet implemented, press F5");
//				}
//			},'-',{
//				text : 'Import',
//				menu : [{
//					text : 'GFF',
//					handler : function() {
//						var gffFileWidget = new GFFFileWidget({viewer:_this.genomeViewer});
//						gffFileWidget.draw();
//						gffFileWidget.onOk.addEventListener(function(sender, args) {
//							_this.genomeViewer.addFeatureTrack(args.title, args.dataAdapter);
//						});
//	
//					}
//				},{
//					text : 'BED',
//					disabled : true,
//					handler : function(sender, args) {
//						_this.genomeViewer.addFeatureTrack(args.title, args.dataAdapter);
//					}
//				},{
//					text : 'VCF',
//					handler : function() {
//						var vcfFileWidget = new VCFFileWidget({viewer:_this.genomeViewer});
//						vcfFileWidget.draw();
//						vcfFileWidget.onOk.addEventListener(function(sender, args) {
//							console.log(args.dataAdapter);
//							_this.genomeViewer.addFeatureTrack(args.title, args.dataAdapter);
//		
//						});
//					}
//				}]
//			},
		]
	});
	
	var viewMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
				text : 'Zoom',
				menu : this.getZoomMenu()
			}, '-',
//			{
//				text : 'Label',
//				menu : this.getLabelMenu()
//			}, '-',
//			{
//				text : 'Karyotype',
//				handler : function() {
//					_this.genomeViewer._showKaryotypeWindow();
//				}
//			}, 
			{
				text : 'Gene legend',
				handler : function() {
					var legendWidget = new LegendWidget({title:"Gene legend"});
					legendWidget.draw(GENE_BIOTYPE_COLORS);
				}
			}
//			,'-',
//			{
//	        	 text:'Ensembl Id',
//	        	 checked:false,
//	        	 handler : function() {
////					GENOMEMAPS_CONFIG.showFeatureStableId = this.checked;
//					_this.position = Math.ceil(_this.genomeViewer.genomeWidget.trackCanvas.getMiddlePoint())+1;
//					
//					_this.genomeViewer.refreshMasterGenomeViewer();
//					
//					if (this.checked){
//						_this.genomeViewer.genomeWidgetProperties.setLabelHeight(9);
//					}
//					else{
//						_this.genomeViewer.genomeWidgetProperties.setLabelHeight(10);
//					}
//	         	}
//	         },
//	         {
//					text : 'Download as',
//					iconCls:'icon-box',
//					menu : [{
//						text:'PNG',iconCls:'icon-blue-box',disabled:false,
//						listeners : {
//							scope : this,
//							'click' : function() {
//								var svg = new XMLSerializer().serializeToString(this.genomeViewer.genomeWidget.trackCanvas._svg);
//								var canvas = DOM.createNewElement("canvas", document.body, [["id", this.id+"png"],["visibility", this.id+"hidden"]]);
//								canvg(canvas, svg);
//								Canvas2Image.saveAsPNG(canvas);
//								$("#"+this.id+"png").remove();
////								DOM.select("canvas").parent.removeChild(canvas);
//							}
//						}
//					},{
//						text:'JPEG',iconCls:'icon-blue-box',disabled:false,
//						listeners : {
//						scope : this,
//							'click' : function() {
//								try{
//									_this.genomeViewer._getPanel().setLoading("Saving image");
//									var svg = new XMLSerializer().serializeToString(this.genomeViewer.genomeWidget.trackCanvas._svg);
//									var canvas = DOM.createNewElement("canvas", document.body, [["id", this.id+"jpg"],["visibility", this.id+"hidden"]]);
//									canvg(canvas, svg);
//									Canvas2Image.saveAsJPEG(canvas); 
//									$("#"+this.id+"jpg").remove();
////									DOM.select("canvas").parent.removeChild(canvas);
//								}
//								catch(e){
//									alert(e);
//								}
//								finally{
//									_this.genomeViewer._getPanel().setLoading(false);
//								}
//							}
//						}
//					}]
//				}
			]
	});
	
	var searchMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [ {
				text: 'Feature',
				menu : this.getFeatureSearchMenu()
			},
			{
				text:'Functional',
				menu: this.getFunctionalSearchMenu()
				
			},{
				text: 'Regulatory',
				menu : this.getRegulatorySearchMenu()
			}
		]
	});
	
	var toolbarMenu = Ext.create('Ext.toolbar.Toolbar', {
		cls:'bio-menubar',
		height:27,
		padding:'0 0 0 10',
//		margins : '0 0 0 5',
		items : [
//		    {
//				text : 'File',
//				menu : fileMenu
//			},
			{
				text : 'View',
				menu : viewMenu
			},{
				text : 'Search',
				menu : searchMenu
			},{
				id : this.id+"tracksMenu",
				text : 'Tracks',
				menu : []
			},{
				text : 'Plugins',
				menu : this.getPluginsMenu()
			}
		]
	});
	return toolbarMenu;
};

/** zoom Menu * */
GenomeMaps.prototype.getZoomMenu = function(chromosome, position) {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
				items : []
			});
	for ( var i = 0; i <= 100; i=i+10) {
		menu.add({text : i + '%', group : 'zoom', checked : false, handler : function() {
			Ext.getCmp(_this.genomeViewer.id+'zoomSlider').setValue(this.text.replace("%", "")); 
		}});
	}
	return menu;
};

/** label Menu **/
GenomeMaps.prototype.getLabelMenu = function() {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
				items : [
				         {
				        	 text:'None',
				        	 handler : function() {
				        	 	_this.genomeViewer.genomeWidgetProperties.setLabelHeight(0);
				        	 	_this.genomeViewer.refreshMasterGenomeViewer();
				         	}
				         },
				         {
				        	 text:'Small',
				        	 handler : function() {
					        	 	_this.genomeViewer.genomeWidgetProperties.setLabelHeight(8);
					        	 	_this.genomeViewer.refreshMasterGenomeViewer();
					         	}
				         },
				         {
				        	 text:'Medium',
				        	 handler : function() {
					        	 	_this.genomeViewer.genomeWidgetProperties.setLabelHeight(10);
					        	 	_this.genomeViewer.refreshMasterGenomeViewer();
					         	}
				         },
				         {
				        	 text:'Large',
				        	 handler : function() {
					        	 	_this.genomeViewer.genomeWidgetProperties.setLabelHeight(12);
					        	 	_this.genomeViewer.refreshMasterGenomeViewer();
					         	}
				         },
				         {
				        	 text:'x-Large',
				        	 handler : function() {
					        	 	_this.genomeViewer.genomeWidgetProperties.setLabelHeight(14);
					        	 	_this.genomeViewer.refreshMasterGenomeViewer();
					         	}
				         }
				         ]
			});
	return menu;
};

/** search Feature Menu **/
GenomeMaps.prototype.getFeatureSearchMenu = function() {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
					items : [ {
						text : 'Genes',
						handler : function() {
							var inputListWidget = new InputListWidget({title:'Gene List',viewer:_this.genomeViewer});
							inputListWidget.onOk.addEventListener(function(evt, geneNames) {
								_this.genomeViewer.openGeneListWidget(geneNames);
							});
							inputListWidget.draw();
						}
					}
//					,
//					{
//						text : 'Transcript',
//						handler : function() {
//							var inputListWidget = new InputListWidget({title:'Ensembl Transcript',viewer:_this.genomeViewer});
//							inputListWidget.onOk.addEventListener(function(evt, names) {
//								_this.genomeViewer.openTranscriptListWidget(names);
//							});
//							inputListWidget.draw();
//						}
//					}
//					,
//					{
//						text : 'Exon',
//						handler : function() {
//							//ENSE00001663727
//							var inputListWidget = new InputListWidget({title:'Ensembl Exon List',viewer:_this.genomeViewer});
//							inputListWidget.onOk.addEventListener(function(evt, geneNames) {
//								_this.genomeViewer.openExonListWidget(geneNames);
//							});
//							inputListWidget.draw();
//						}
//					}
					,
					{
						text : 'SNP',
						handler : function() {
							var inputListWidget = new InputListWidget({title:'SNP List',viewer:_this.genomeViewer});
							inputListWidget.onOk.addEventListener(function(evt, snpNames) {
								_this.genomeViewer.openSNPListWidget(snpNames);
							});
							inputListWidget.draw();
						}
					}
//					,
//					{
//						text : 'Protein',
//						handler : function() {
//							var inputListWidget = new InputListWidget({title:'Ensembl Protein',viewer:_this.genomeViewer});
//							inputListWidget.onOk.addEventListener(function(evt, snpNames) {
//								_this.genomeViewer.openGOListWidget(snpNames);
//							});
//							inputListWidget.draw();
//						}
//					}
					
					
					]
			});
	return menu;
};

GenomeMaps.prototype.getFunctionalSearchMenu = function() {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
					items : [ 
	        	  {
						text : 'GO',
						handler : function() {
							var inputListWidget = new InputListWidget({title:'Gene Ontology',viewer:_this.genomeViewer});
							inputListWidget.onOk.addEventListener(function(evt, snpNames) {
								_this.genomeViewer.openGOListWidget(snpNames);
							});
							inputListWidget.draw();
						}
					},
					{
						text : 'Reactome',
						disabled:true,
						handler : function() {
							alert("Not yet implemented");
						}
					}
//					,
//					{
//						text : 'Interpro',
//						handler : function() {
//							var inputListWidget = new InputListWidget({title:'Protein',viewer:_this.genomeViewer});
//							inputListWidget.onOk.addEventListener(function(evt, snpNames) {
//								_this.genomeViewer.openGOListWidget(snpNames);
//							});
//							inputListWidget.draw();
//						}
//					}
					]
			});
	return menu;
};

GenomeMaps.prototype.getRegulatorySearchMenu = function() {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
					items : [ 
	        	  {
						text : 'miRNA Target',
						disabled:true,
						handler : function() {
	        		  		alert("Not yet implemented");
						}
					},
					{
						text : 'TFBS',
						disabled:true,
						handler : function() {
							alert("Not yet implemented");
						}
					}
					]
			});
	return menu;
};

//XXX DEPRECATED
GenomeMaps.prototype.getTracksMenuOLD = function() {
	var _this = this;
	if(this.tracksMenu!=null){
		this.tracksMenu.destroy();
	}
	
	this.tracksMenu = Ext.create('Ext.menu.Menu', {
				id:this.id+"tracksMenuInit",
				margin : '0 0 10 0',
				floating : true,
				items : [{
						id:this.id+"tracksMenuCore",
						text : 'Core',
						menu : [
						        {
							id : 'Gene/Transcript',
							text : 'Gene/Transcript',
							checked : true,
							disabled : true,
							handler : function() {
//								if(this.checked){
//									  if(_this.genomeViewer.trackSvgLayout.swapHash[this.text]){
//										  _this.genomeViewer.trackSvgLayout._showTrack(this.text);
//									  }else{
//										  _this.addTrack(this.text);
//									  }
//								  }
//								  else{
//									  _this.genomeViewer.trackSvgLayout._hideTrack(this.text);
//								  }
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, 
						{
							id : 'Cytoband',
							text : 'Cytoband',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'Sequence',
							text : 'Sequence',
							checked : false,
							disabled : true,
							handler : function() {
//								if(this.checked){
//									  if(_this.genomeViewer.trackSvgLayout.swapHash[this.text]){
//										  _this.genomeViewer.trackSvgLayout._showTrack(this.text);
//									  }else{
//										  _this.addTrack(this.text);
//									  }
//								  }
//								  else{
//									  _this.genomeViewer.trackSvgLayout._hideTrack(this.text);
//								  }
//								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
//								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'CpG islands',
							text : 'CpG islands',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}]
					}, {
						id:this.id+"tracksMenuVariation",
						text : 'Variation',
						menu : [{
							id : 'SNP',
							text : 'SNP',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'Mutation',
							text : 'Mutation',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'Structural variation',
							text : 'Structural variation',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}
		
						]
					}, {
						id:this.id+"tracksMenuRegulatory",
						text : 'Regulatory',
						menu : [{
							id : 'miRNA targets',
							text : 'miRNA targets',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'TFBS',
							text : 'TFBS',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}, {
							id : 'Histone',
							text : 'Histone',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						},
						{
							id : 'Polymerase',
							text : 'Polymerase',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}
						,
						{
							id : 'Open Chromatin',
							text : 'Open Chromatin',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						},
//						{
//							text : 'Triplex',
//							checked : false,
//							disabled : true,
//							handler : function() {
//								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
//								_this.genomeViewer.refreshMasterGenomeViewer();
//							}
//						}, 
						{
							id : 'Conserved regions',
							text : 'Conserved regions',
							checked : false,
							disabled : true,
							handler : function() {
								_this.genomeViewer.genomeWidgetProperties.tracks[this.text] = this.checked;
								_this.genomeViewer.refreshMasterGenomeViewer();
							}
						}]
						
					}, "-", 
					{
						id : this.id+"tracksMenuDAS",
						text : 'DAS',
						menu : this.getDASMenu()
					
					}]
		
				});
	return this.tracksMenu;
};

GenomeMaps.prototype.setTracksMenu = function() {
	Ext.getCmp(this.id+"tracksMenu").menu=this.getTracksMenu();
};

GenomeMaps.prototype.getTracksMenu = function() {
	var _this = this;
	if(this._TracksMenu!=null){
		this._TracksMenu.destroy();
	}
	
	var species = this.genomeViewer.species;
	var categories = TRACKS[SPECIES_TRACKS_GROUP[species]];
	
	var items = new Array();
	
	for (var i = 0, leni = categories.length; i < leni; i++) {
		var sources = [];
		for ( var j = 0, lenj = categories[i].tracks.length; j < lenj; j++){
			sources.push({
				text : categories[i].tracks[j].id,
				disabled : categories[i].tracks[j].disabled,
				checked : categories[i].tracks[j].checked,
				handler : function() {
					if(this.checked){
//						if(_this.genomeViewer.trackSvgLayout.swapHash[this.text]){
//							_this.genomeViewer.trackSvgLayout._showTrack(this.text);
//						}else{
							_this.addTrack(this.text);
//						}
					}
					else{
						_this.genomeViewer.removeTrack(this.text);
					}
				}
			});
		}
		items.push({
			text : categories[i].category,
			menu : sources
		});
	}
	
	items.push("-");
	items.push({
		id : this.id+"tracksMenuDAS",
		text : 'DAS',
		menu : this.getDASMenu()
	});
	
	
	this._TracksMenu = Ext.create('Ext.menu.Menu', {
		id:this.id_panel+"_TracksMenu",
		margin : '0 0 10 0',
		floating : true,
		items : items
	});
	return this._TracksMenu;
};

GenomeMaps.prototype.getDASMenu = function() {
	var _this = this;
	
	var tracks = DAS_TRACKS;
	var species = this.genomeViewer.species;
	//Auto generate menu items depending of DAS_TRACKS config
//	var menu = this.getDASMenu();
//	menu.removeAll(); // Remove the old DAS
	
	var items = new Array();
	
	for (var i = 0, leni = tracks.length; i < leni; i++) {
		if(tracks[i].species == species){
			for ( var j = 0, lenj = tracks[i].categories.length; j < lenj; j++){
				var sources = [];
				for ( var k = 0, lenk = tracks[i].categories[j].sources.length; k < lenk; k++){
					sources.push({text : tracks[i].categories[j].sources[k].name,
								  sourceName : tracks[i].categories[j].sources[k].name,
								  sourceUrl : tracks[i].categories[j].sources[k].url,
								  checked : tracks[i].categories[j].sources[k].checked,
								  handler : function() {
									  if(this.checked){
//										  if(_this.genomeViewer.trackSvgLayout.swapHash[this.sourceName]){
//											  _this.genomeViewer.trackSvgLayout._showTrack(this.sourceName);
//										  }else{
											  _this.addDASTrack(this.sourceName, this.sourceUrl);
//										  }
									  }
									  else{
										  _this.genomeViewer.removeTrack(this.sourceName);
									  }
								  }
					});
				}
				items.push({
					text : tracks[i].categories[j].name,
					menu : sources
				});
			}
			break;
		}
	}
	
	//Add custom source
	items.push("-",{
		text : 'Add custom...',
		handler : function() {
			var urlWidget = new UrlWidget({title:'Add a DAS track'});
			urlWidget.onAdd.addEventListener(function(sender, event) {
				_this.addDASTrack(event.name, event.url);
				_this.setCustomDASMenu(event.name);
			});
			urlWidget.draw();
		},
		menu :{
			id:this.id+"_customDASMenu",
			margin : '0 0 10 0',
			floating : true,
			items : []
		}
	});
	
	this._DASMenu = Ext.create('Ext.menu.Menu', {
		id:this.id_panel+"_DASMenu",
		margin : '0 0 10 0',
		floating : true,
		items : items
	});
	return this._DASMenu;
};

GenomeMaps.prototype.setCustomDASMenu = function(name) {
	var _this = this;
	Ext.getCmp(this.id+"_customDASMenu").add({
		text : name,
		checked : true,
		handler : function() {
			if(this.checked){
				  _this.genomeViewer.showTrack(this.text);
			  }
			  else{
				  _this.genomeViewer.hideTrack(this.text);
			  }
		}
	});
};

GenomeMaps.prototype.getPluginsMenu = function() {
	if(this._pluginsMenu == null){
		this._pluginsMenu = Ext.create('Ext.menu.Menu', {
			id:this.id+"_pluginsMenu",
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._pluginsMenu;
};

GenomeMaps.prototype.setPluginsMenu = function() {
	var _this = this;
	var plugins_cat = GENOME_MAPS_AVAILABLE_PLUGINS;
	var species = this.genomeViewer.species;
	
	//Auto generate menu items depending of AVAILABLE_PLUGINS config
	var menu = this.getPluginsMenu();
	menu.removeAll(); // Remove the old entries
	menu.add([{
		id : this.id+"tracksMenuPlugins",
		text : 'Load',
		menu : [{
			id : this.id+"tracksMenuGFF",
			text : 'GFF',
			handler : function() {
//			_this.getGFFUploadMenu();
//			_this.openGFFDialog.show();
			var gffFileWidget = new GFFFileWidget({viewer:_this.genomeViewer});
			gffFileWidget.draw();
			if (_this.wum){
				_this.headerWidget.onLogin.addEventListener(function (sender){
					gffFileWidget.sessionInitiated();
				});
				_this.headerWidget.onLogout.addEventListener(function (sender){
					gffFileWidget.sessionFinished();
				});
			}
			gffFileWidget.onOk.addEventListener(function(sender, event) {
				var gffTrack = new TrackData(event.fileName,{
					adapter: event.adapter
				});
				_this.genomeViewer.addTrack(gffTrack,{
					id:event.fileName,
					featuresRender:"MultiFeatureRender",
//					histogramZoom:80,
					height:150,
					visibleRange:{start:0,end:100},
					featureTypes:FEATURE_TYPES
				});
			});

		}
		}, {
			id : this.id+"tracksMenuBED",
			text : 'BED',
			handler : function() {
				var bedFileWidget = new BEDFileWidget({viewer:_this.genomeViewer});
				bedFileWidget.draw();
				if (_this.wum){
					_this.headerWidget.onLogin.addEventListener(function (sender){
						bedFileWidget.sessionInitiated();
					});
					_this.headerWidget.onLogout.addEventListener(function (sender){
						bedFileWidget.sessionFinished();
					});
				}
				bedFileWidget.onOk.addEventListener(function(sender, event) {
					var bedTrack = new TrackData(event.fileName,{
						adapter: event.adapter
					});
					_this.genomeViewer.addTrack(bedTrack,{
						id:event.fileName,
						featuresRender:"MultiFeatureRender",
//						histogramZoom:80,
						height:150,
						visibleRange:{start:0,end:100},
						featureTypes:FEATURE_TYPES
					});
				});
			}
		},
		{
			id : this.id+"tracksMenuVCF",
			text : 'VCF',
			handler : function() {
			var vcfFileWidget = new VCFFileWidget({viewer:_this.genomeViewer});
			vcfFileWidget.draw();
			if (_this.wum){
				_this.headerWidget.onLogin.addEventListener(function (sender){
					vcfFileWidget.sessionInitiated();
				});
				_this.headerWidget.onLogout.addEventListener(function (sender){
					vcfFileWidget.sessionFinished();
				});
			}
			vcfFileWidget.onOk.addEventListener(function(sender, event) {
				var vcfTrack = new TrackData(event.fileName,{
					adapter: event.adapter
				});
				_this.genomeViewer.addTrack(vcfTrack,{
					id:event.fileName,
					featuresRender:"MultiFeatureRender",
//					histogramZoom:80,
					height:150,
					visibleRange:{start:0,end:100},
					featureTypes:FEATURE_TYPES
				});
			});
		}
		}

		]
	}]);
	

	//XXX ANALYSIS PLUGINS
	for (var i = 0, leni = plugins_cat.length; i < leni; i++) {
		// If category is blank, adds directly a button in the root menu
		if(plugins_cat[i].category == ""){
			for (var j = 0, lenj = plugins_cat[i].plugins.length; j < lenj; j++){
				menu.add({
					text : plugins_cat[i].plugins[j].name,
					pluginName : plugins_cat[i].plugins[j].name,
					handler : function() {
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].setViewer(_this.genomeViewer);
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].draw();
//						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].launch();
					}
				});
			}
		}
		else{
			var sources = [];
			for (var j = 0, lenj = plugins_cat[i].plugins.length; j < lenj; j++){
//			if(plugins[i].species == species){
				sources.push({text : plugins_cat[i].plugins[j].name,
					pluginName : plugins_cat[i].plugins[j].name,
					handler : function() {
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].setViewer(_this.genomeViewer);
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].draw();
//						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].launch();
					}
				});
//				break;
//			}
			}
			menu.add({
				text : plugins_cat[i].category,
				menu : sources
			});
		}
	}
	//XXX ANALYSIS PLUGINS
	
	
};










//GenomeMaps.prototype.getPluginsMenuOLD = function(chromosome, position) {
//	var _this = this;
//	if(this.pluginsMenu==null){
//		return Ext.create('Ext.menu.Menu', {
//			margin : '0 0 10 0',
//			floating : true,
//			items : [{
//						text : 'Expression',
//						handler : function() {
//							var expressionGenomicAttributesWidget = new ExpressionGenomicAttributesWidget(_this.genomeViewer.species);
//							
//							if (_this.wum){
//								_this.headerWidget.onLogin.addEventListener(function (sender){
//									expressionGenomicAttributesWidget.attributesPanel.sessionInitiated();
//								});
//								_this.headerWidget.onLogout.addEventListener(function (sender){
//									expressionGenomicAttributesWidget.attributesPanel.sessionFinished();
//								});
//							}
//							expressionGenomicAttributesWidget.draw();
//							expressionGenomicAttributesWidget.onMarkerClicked.addEventListener(function(sender, feature){
//								_this.goTo(feature.chromosome, feature.start);
//								
//							});
//							
//							expressionGenomicAttributesWidget.onTrackAddAction.addEventListener(function(sender, feature){
//								console.log(feature);
//								_this.addTrackFromFeaturesList(feature);
//								
//							});
//
//						}
//					},
//					{
//						text : 'Genotype',
//						handler : function() {
//							var genotypeGenomicAttributesWidget =  new GenotypeGenomicAttributesWidget(_this.genomeViewer.species);
//							
//							if (_this.wum){
//								_this.headerWidget.onLogin.addEventListener(function (sender){
//									genotypeGenomicAttributesWidget.attributesPanel.sessionInitiated();
//								});
//								_this.headerWidget.onLogout.addEventListener(function (sender){
//									genotypeGenomicAttributesWidget.attributesPanel.sessionFinished();
//								});
//							}
//							
//							genotypeGenomicAttributesWidget.draw();
//							
//							genotypeGenomicAttributesWidget.onMarkerClicked.addEventListener(function(sender, feature){
//								_this.goTo(feature.chromosome, feature.start);
//							});
//							
//							genotypeGenomicAttributesWidget.onTrackAddAction.addEventListener(function(sender, feature){
//								_this.addTrackFromFeaturesList(feature);
//								
//							});
//						}
//					}]
//		});
//	}
//	
//	return Ext.create('Ext.menu.Menu', {
//		margin : '0 0 10 0',
//		floating : true,
//		items : this.pluginsMenu
//	});
//	
//	
//};