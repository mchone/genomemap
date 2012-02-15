var expressionPlugin = new GenericPlugin('Expression', {title: 'Expression',
											  	width: 1035,
											  	height: 653,
											  	launch: function() { auxExpression(); }
});


function auxExpression(){
//	expressionPlugin.closeWindow();
	var species = genomeMaps.genomeViewer.species;
	
	var expressionGenomicAttributesWidget = new ExpressionGenomicAttributesWidget(species);
	
	if (genomeMaps.wum){
		genomeMaps.headerWidget.onLogin.addEventListener(function (sender){
			expressionGenomicAttributesWidget.attributesPanel.sessionInitiated();
		});
		genomeMaps.headerWidget.onLogout.addEventListener(function (sender){
			expressionGenomicAttributesWidget.attributesPanel.sessionFinished();
		});
	}
//	expressionGenomicAttributesWidget.draw();
	expressionPlugin.addSenchaElement(expressionGenomicAttributesWidget.getMainPanel());
	expressionGenomicAttributesWidget.onMarkerClicked.addEventListener(function(sender, feature){
	genomeMaps.goTo(feature.chromosome, feature.start);
		
	});
	
	expressionGenomicAttributesWidget.onTrackAddAction.addEventListener(function(sender, feature){
		console.log(feature);
		genomeMaps.addTrackFromFeaturesList(feature);
	});
	
};
