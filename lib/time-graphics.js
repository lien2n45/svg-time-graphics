var Graphic = (function(){
	var _svgns = "http://www.w3.org/2000/svg";
	var _oEventsInfo = {};
	var _linealMap = function(x1, y1, x2, y2, xx, yy){ //calculate the linear function of (x1,y1), (x2,y2) and return image of xx or antiimage of yy if xx is undefined
		var m = (y1 - y2)/(x1 - x2);
		var n = y1 - x1*m;
		if (!xx) { //return antiimage of yy
			var antiimage = (yy-n)/m;
			return antiimage;
		}
		else{ //return image of xx
			var image = m*xx+n;
			return image;
		}
	};
	var _uid = function(){
		var alphabet = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
		var sRet = '';
		for (var i = 0; i < 4; i++) {
			var nIndex = Math.floor(Math.random()*1e6) % alphabet.length;
			sRet += alphabet[nIndex];
		}
		return sRet;
	};
	var _getMax = function(anValsOraoVals, sProperty){
		var max = -Infinity;
		for (var i = anValsOraoVals.length - 1; i >= 0; i--) {
			if (sProperty) {
				if (anValsOraoVals[i][sProperty] > max) {
					max = anValsOraoVals[i][sProperty];
				}
			}
			else{
				if (anValsOraoVals[i] > max) {
					max = anValsOraoVals[i];
				}
			}
		}
		return max === -Infinity ? undefined : max;
	};
	var _getMin = function(anValsOraoVals, sProperty){
		var min = Infinity;
		for (var i = anValsOraoVals.length - 1; i >= 0; i--) {
			if (sProperty) {
				if (anValsOraoVals[i][sProperty] < min) {
					min = anValsOraoVals[i][sProperty];
				}
			}
			else{
				if (anValsOraoVals[i] < min) {
					min = anValsOraoVals[i];
				}
			}
		}
		return min === Infinity ? undefined : min;
	};
	var Graphic = function(sDivId){ //constructor
		var _drawLine = function(x1, y1, x2, y2, eContainer, oConfig){
			var sStyle = (oConfig && oConfig.style) || 'solid';
			var sColor = (oConfig && oConfig.color) || 'black';
			var sId = _uid();
			if (sStyle === 'solid') {
				var eLine = document.createElementNS(_svgns, 'line');
				eLine.setAttributeNS(null, 'x1', x1);
				eLine.setAttributeNS(null, 'y1', y1);
				eLine.setAttributeNS(null, 'x2', x2);
				eLine.setAttributeNS(null, 'y2', y2);
				eLine.setAttributeNS(null, 'style', 'stroke:'+sColor+';stroke-width:1');
				eLine.id = sId;
				eContainer.appendChild(eLine);
			}
			else if (sStyle === 'dotted') {
				var sPath = document.createElementNS(_svgns, 'path');
				sPath.setAttributeNS(null, 'stroke-dasharray', '5,5');
				sPath.setAttributeNS(null, 'd', 'M '+x1+' '+y1+' L'+x2+' '+y2);
				sPath.setAttributeNS(null, 'style', 'stroke:'+sColor+';stroke-width:1');
				sPath.id = sId;
				eContainer.appendChild(sPath);
			}
			return sId;
		};
		var _drawDot = function(x, y, eContainer, oConfig){
			var sColor = (oConfig && oConfig.color) || 'black';
			var sRadius = (oConfig && oConfig.radius) || '8';
			var sClass = (oConfig && oConfig.className) || 'dot';
			var sId = _uid();
			var eDot = document.createElementNS(_svgns, 'circle');
			eDot.setAttributeNS(null, 'cx', x);
			eDot.setAttributeNS(null, 'cy', y);
			eDot.setAttributeNS(null, 'r', sRadius);
			eDot.setAttributeNS(null, 'fill', sColor);
			eDot.setAttributeNS(null, 'class', sClass);
			eDot.id = sId;
			eContainer.appendChild(eDot);
			return sId;
		};
		var _fillBackgroundColor = function(x1, y1, x2, y2, eContainer, sColor){
			//delete previous fills:
			if (oChart.eFillBackgroundGroup) {
				oChart.eFillBackgroundGroup.parentNode.removeChild(oChart.eFillBackgroundGroup);
				if (arguments[0] === null) {
					oChart.eFillBackgroundGroup = undefined;
					return;
				}
			}
			x1 = x1<0 ? 0 : x1;
			y1 = y1<0 ? 0 : y1;
			var aux;
			if (x2<x1) {
				aux = x1;
				x1=x2;
				x2=aux;
			}
			if (y2<y1) {
				aux = y1;
				y1=y2;
				y2=aux;
			}
			var eRect = document.createElementNS(_svgns, 'rect');
			eRect.setAttributeNS(null, 'x', x1);
			eRect.setAttributeNS(null, 'y', y1);
			eRect.setAttributeNS(null, 'width', x2-x1);
			eRect.setAttributeNS(null, 'height', y2-y1);
			eRect.setAttributeNS(null, 'style', 'fill: '+sColor+';fill-opacity: 0.2;');
			oChart.eFillBackgroundGroup = document.createElementNS(_svgns, 'g');
			oChart.eFillBackgroundGroup.setAttributeNS(null, 'class', 'background-fill');
			oChart.eFillBackgroundGroup.appendChild(eRect);
			//eContainer.insertBefore(oChart.eFillBackgroundGroup, eContainer.firstChild);
			eContainer.appendChild(oChart.eFillBackgroundGroup);
		};
		var _refreshChartInfo = function(){ //update oChart to adjust all funcitons to chart. Like zoom restart
			var /*max=-Infinity, min=Infinity, */since=Infinity, until=0;
			for (var i = 0; i < oChart.aFunctions.length; i++) {
				/*if(oChart.aFunctions[i].max > max){
					max = oChart.aFunctions[i].max;
				}
				if(oChart.aFunctions[i].min < min){
					min = oChart.aFunctions[i].min;
				}*/
				if(oChart.aFunctions[i].since < since){
					since = oChart.aFunctions[i].since;
				}
				if(oChart.aFunctions[i].until > until){
					until = oChart.aFunctions[i].until;
				}
			}
			/*oChart.max = max;
			oChart.min = min;*/
			oChart.since = since;
			oChart.until = until;
		};
		var _drawCharts = function(){ //container is always eChart
			_drawGrid();
			var i, j, len;
			var aeFunctions = document.getElementsByClassName('function');
			for (i = 0, len = aeFunctions.length; i < len; i++) {
				aeFunctions[0].parentNode.removeChild(aeFunctions[0]); //aeFunctions is modified when elements are deleted
			}
			var fnFilterValue = function(oVal){
				return oVal.date >= oChart.since && oVal.date <= oChart.until;
			};
			var fnGetValueByDate = function(aData, nDate){
				var oPrevData = aData[0], oNextData;
				for (var i = 0; i < aData.length; i++) {
					if (aData[i].date <= nDate) {
						oPrevData = aData[i];
					}
					else{
						oNextData = aData[i];
						break;
					}
				}
				if (oPrevData && oNextData) {
					return _linealMap(oPrevData.date, oPrevData.value, oNextData.date, oNextData.value, nDate);
				}
				return 0;
			};
			var fnMouseOverListener = function(oEvent){
				eInfoDiv.lastChild.innerHTML = oEvent.target.getAttributeNS(null, 'class');
			};
			var fnMouseOutListener = function(oEvent){
				window.setTimeout(function(){
					if (!oEvent.target.parentNode.querySelector(':hover')){ //not hover
						eInfoDiv.lastChild.innerHTML = '';
					}
				}, 1000);
			};
			for (i = 0; i < oChart.aFunctions.length; i++) {
				//draw data:
				var aData = oChart.aFunctions[i].data.filter(fnFilterValue); //copy the data whitin bounds
				oChart.aFunctions[i].eGroup = document.createElementNS(_svgns, 'g');
				oChart.aFunctions[i].eGroup.setAttributeNS(null, 'id', oChart.aFunctions[i].id);
				oChart.aFunctions[i].eGroup.setAttributeNS(null, 'class', 'function');
				var eData = document.createElementNS(_svgns, 'g');
				eData.setAttributeNS(null, 'class', 'data');
				oChart.aFunctions[i].eGroup.appendChild(eData);
				//debugger;
				for (j = 0; j < aData.length - 1; j++) {
					_drawLine(
						_date2Px(aData[j].date),
						_value2Px(aData[j].value, oChart.aFunctions[i].id),
						_date2Px(aData[j+1].date),
						_value2Px(aData[j+1].value, oChart.aFunctions[i].id),
						eData,
						{color: oChart.aFunctions[i].config.color}
					);
				}
				//draw occurrences:
				var aOccurrences = oChart.aFunctions[i].occurrences.filter(fnFilterValue); //copy the occurrences whitin bounds
				//debugger;
				var eOccurrences = document.createElementNS(_svgns, 'g');
				eOccurrences.setAttributeNS(null, 'class', 'occurrences');
				oChart.aFunctions[i].eGroup.appendChild(eOccurrences);
				for (j = 0; j < aOccurrences.length; j++) {
					_drawDot(
						_date2Px(aOccurrences[j].date),
						_value2Px(fnGetValueByDate(aData, aOccurrences[j].date), oChart.aFunctions[i].id),
						eOccurrences,
						{color: oChart.aFunctions[i].config.color, className: aOccurrences[j].occurrence}
					);
				}
				//occurrences mouse listener:
				eOccurrences.addEventListener('mouseover', fnMouseOverListener, false);
				eOccurrences.addEventListener('mouseout', fnMouseOutListener, false);
				oChart.eChart.appendChild(oChart.aFunctions[i].eGroup);
			}
		};
		var _drawGrid = function(){ //container is always eChart
			//delete existing grid:
			if(oChart.eGridGroup){
				oChart.eGridGroup.parentNode.removeChild(oChart.eGridGroup);
			}
			var i;
			var aDivisions = [200, 1e3, 30e3, 60e3, 5*60e3, 15*60e3, 60*60e3, 6*3600e3, 24*3600e3]; //ms
			var nTotalTime = oChart.until - oChart.since;
			for (i = 0; i < aDivisions.length; i++) {
				if (nTotalTime/aDivisions[i] < 60) {
					break;
				}
			}
			oChart.eGridGroup = document.createElementNS(_svgns, 'g');
			oChart.eGridGroup.setAttributeNS(null, 'id', _uid());
			oChart.eGridGroup.setAttributeNS(null, 'class', 'grid');
			oChart.eChart.appendChild(oChart.eGridGroup);
			var fnBoundary = function(nDate, step){ //returns the first date of the next block where nDate is. blocks are step ms long
				return nDate + step - nDate%step;
			};
			var nDate = fnBoundary(oChart.since, aDivisions[i]);
			while(nDate < oChart.until){
				var x = _date2Px(nDate);
				_drawLine(x, 0, x, oChart.nChartHeight, oChart.eGridGroup, {color: '#ccc'});
				nDate = fnBoundary(nDate, aDivisions[i]);
			}
		};
		var _px2Date = function(nPxX){
			return _linealMap(0, oChart.since, oChart.nChartWidth, oChart.until, nPxX);
		};
		var _px2Value = function(nPxY, sIdFunction){
			for (var i = 0; i < oChart.aFunctions.length; i++) {
				if (oChart.aFunctions[i].id === sIdFunction){
					return _linealMap(0, oChart.aFunctions[i].max, oChart.nChartHeight, oChart.aFunctions[i].min, nPxY);
				}
			}
		};
		var _date2Px = function(nDate){
			return _linealMap(oChart.since, 0, oChart.until, oChart.nChartWidth, nDate);
		};
		var _value2Px = function(nValue, sIdFunction){
			for (var i = 0; i < oChart.aFunctions.length; i++) {
				if (oChart.aFunctions[i].id === sIdFunction){
					return _linealMap(oChart.aFunctions[i].max, 0, oChart.aFunctions[i].min, oChart.nChartHeight, nValue);
				}
			}
		};
		var _drawCursorLines = function(nCursorX, nCursorY){
			if (oChart.eCursorLinesGroup) {
				oChart.eCursorLinesGroup.parentNode.removeChild(oChart.eCursorLinesGroup);
			}
			oChart.eCursorLinesGroup = document.createElementNS(_svgns, 'g');
			oChart.eCursorLinesGroup.setAttributeNS(null, 'id', _uid());
			oChart.eCursorLinesGroup.setAttributeNS(null, 'class', 'cursor-lines');
			oChart.eChart.appendChild(oChart.eCursorLinesGroup);
			_drawLine(nCursorX, 0, nCursorX, oChart.nChartHeight, oChart.eCursorLinesGroup, {color: 'grey', style: 'dotted'});
			_drawLine(0, nCursorY, oChart.nChartWidth, nCursorY, oChart.eCursorLinesGroup, {color: 'grey', style: 'dotted'});
		};
		var _writeValues = function(nCursorX, nCursorY){
			if (oMainSvg.eTextValueGroup) {
				oMainSvg.eTextValueGroup.parentNode.removeChild(oMainSvg.eTextValueGroup);
			}
			oMainSvg.eTextValueGroup = document.createElementNS(_svgns, 'g');
			oMainSvg.eTextValueGroup.setAttributeNS(null, 'class', 'cursor-values');
			var eTextValue;
			//debugger;
			for (var i = 0; i < oChart.aFunctions.length; i++) {
				eTextValue = document.createElementNS(_svgns, 'text');
				eTextValue.setAttributeNS(null, 'x', oChart.eChart.x.baseVal.value/*offset*/ + oChart.nChartWidth);
				eTextValue.setAttributeNS(null, 'y', oChart.eChart.y.baseVal.value/*offset*/ + nCursorY + i*10);
				eTextValue.setAttributeNS(null, 'font-size', '10');
				eTextValue.setAttributeNS(null, 'fill', oChart.aFunctions[i].config.color);
				eTextValue.textContent = '' + _px2Value(nCursorY, oChart.aFunctions[i].id);
				oMainSvg.eTextValueGroup.appendChild(eTextValue);
			}
			oMainSvg.eMainSvg.appendChild(oMainSvg.eTextValueGroup);
			if (!oMainSvg.eTextDate) { //first time
				oMainSvg.eTextDate = document.createElementNS(_svgns, 'text');
			}
			console.log('ya');
			oMainSvg.eTextDate.setAttributeNS(null, 'x', oChart.eChart.x.baseVal.value/*offset*/ + nCursorX);
			oMainSvg.eTextDate.setAttributeNS(null, 'y', oChart.eChart.y.baseVal.value/*offset*/ + oChart.nChartHeight);
			oMainSvg.eTextDate.setAttributeNS(null, 'font-size', '10');
			oMainSvg.eTextDate.textContent = '' + _px2Date(nCursorX);
			oMainSvg.eMainSvg.appendChild(oMainSvg.eTextDate);
		};
		var _addNewData = function(oFunction, aNewData){ //sort and map data
			var i;
			if (!oFunction.config) {
				oFunction.data = oFunction.data.concat(aNewData);
			}
			else{
				for (i = 0; i < aNewData.length; i++) {
					oFunction.data.push({
						date: aNewData[i][oFunction.config.date || 'date'] ,
						value: aNewData[i][oFunction.config.value || 'value']
					});
				}
			}
			oFunction.data.sort(function(d1, d2){
				return d1.date - d2.date;
			});
			oFunction.max = _getMax(oFunction.data, 'value');
			oFunction.min = _getMin(oFunction.data, 'value');
			oFunction.since = oFunction.data[0].date;
			oFunction.until = oFunction.data.slice(-1)[0].date;
		};
		var _addNewOccurrences = function(oFunction, aNewOccurrences){ //sort and map occurrences
			oFunction.occurrences = oFunction.occurrences.concat(aNewOccurrences);
			oFunction.occurrences.sort(function(o1, o2){
				return o1.date - o2.date;
			});
		};
		var oGraphic = {}; //object to return
		//create svg:
		var eDiv = document.querySelector('div#'+sDivId);
		eDiv.innerHTML = '<div class="info" style="height:6%"><span class="value"></span><span class="occurrence" style="float: right;"></span></div><div class="graphic" style="height:94%"></div>';
		//get useful vars:
		var nDivHeight = eDiv.offsetHeight;
		var nDivWidth = eDiv.offsetWidth;
		var eGraphicDiv = document.querySelector('div#'+sDivId+'>div.graphic');
		var eInfoDiv = document.querySelector('div#'+sDivId+'>div.info');
		//main container:
		var oMainSvg = {};
		oMainSvg.eMainSvg = document.createElementNS(_svgns, 'svg');
		oMainSvg.eMainSvg.setAttributeNS(null, 'height', nDivHeight*0.94);
		oMainSvg.eMainSvg.setAttributeNS(null, 'y', nDivHeight*0.06);
		oMainSvg.eMainSvg.setAttributeNS(null, 'width', nDivWidth);
		//chart container:
		var oChart = {
			offsetMainX: nDivWidth*0.1,
			offsetMainY: nDivHeight*0.1
		};
		oChart.eChart = document.createElementNS(_svgns, 'svg');
		oChart.eChart.setAttributeNS(null, 'height', nDivHeight*0.8);
		oChart.eChart.setAttributeNS(null, 'width', nDivWidth*0.8);
		oChart.eChart.setAttributeNS(null, 'x', oChart.offsetMainX);
		oChart.eChart.setAttributeNS(null, 'y', oChart.offsetMainY);
		//get useful vars:
		oChart.nChartHeight = oChart.eChart.height.baseVal.value;
		oChart.nChartWidth = oChart.eChart.width.baseVal.value;
		//fill background chart with yellow color:
		oChart.eChart.setAttributeNS(null, 'style', 'fill:#FFFFD7;');
		var eBckgndRect = document.createElementNS(_svgns, 'rect');
		eBckgndRect.setAttributeNS(null, 'x', 0);
		eBckgndRect.setAttributeNS(null, 'y', 0);
		eBckgndRect.setAttributeNS(null, 'height', oChart.nChartHeight);
		eBckgndRect.setAttributeNS(null, 'width', oChart.nChartWidth);
		oChart.eChart.appendChild(eBckgndRect);
		oMainSvg.eMainSvg.appendChild(oChart.eChart);
		eGraphicDiv.appendChild(oMainSvg.eMainSvg);
		//mouse up and mouse down keys:
		document.addEventListener('mousedown', function(){
			_oEventsInfo.mousedown = true;
		}, false);
		document.addEventListener('mouseup', function(){
			_oEventsInfo.mousedown = false;
		}, false);
		//events of mouse listener functions:
		var fnMouseMoveListener = (function(){ //add the marks following the cursor and put the values next to chart
			var bPreviousMousedown = false, nStartMouseX;
			return function(oEvent){
				//console.dir(oEvent);
				var nCursorX = oEvent.pageX/*absolute*/ - oChart.offsetMainX/*offset of chart*/ - oMainSvg.eMainSvg.offsetLeft/*offset of main*/;
				var nCursorY = oEvent.pageY - oChart.offsetMainY - oMainSvg.eMainSvg.offsetTop;
				//fill background:
				if (!bPreviousMousedown && _oEventsInfo.mousedown) { //start filling background color
					nStartMouseX = nCursorX;
				}
				if (_oEventsInfo.mousedown) {
					_fillBackgroundColor(nStartMouseX, 0, nCursorX, oChart.nChartHeight, oChart.eChart, '#aaaaff');
				}
				if (bPreviousMousedown && !_oEventsInfo.mousedown) { //trigger event and delete filling
					oMediator.publish('select', {
						since: _px2Date(nStartMouseX<nCursorX ? nStartMouseX : nCursorX),
						until: _px2Date(nStartMouseX>nCursorX ? nStartMouseX : nCursorX)
					});
					_fillBackgroundColor(null);
				}
				_drawCursorLines(nCursorX, nCursorY);

				//insert the text in the right side of the chart:
				_writeValues(nCursorX, nCursorY);

				//insert info at the top in eInfoDiv
				eInfoDiv.firstChild.innerHTML = 'Date:'+ new Date(_px2Date(nCursorX))+' Value:'+_px2Value(nCursorY);

				//for the fill color
				bPreviousMousedown = _oEventsInfo.mousedown;
			};
		})();
		oMainSvg.eMainSvg.addEventListener('mousemove', fnMouseMoveListener, false); //oMainSvg.eMainSvg because if eChart is used, then only triggers mouse touches a line.
		oMainSvg.eMainSvg.addEventListener('mousewheel', function(oEvent){
			//console.dir(oEvent); //wheelDelta is 120 when up and -120 when down
			var nZoomFactor = Math.pow(2, oEvent.wheelDelta/120);
			var nPeriod = (oChart.until - oChart.since);
			var nMean = (oChart.until + oChart.since) / 2;
			var nNewPeriod = nPeriod/nZoomFactor;
			var nNewSince = nMean - nNewPeriod/2;
			var nNewUntil = nMean + nNewPeriod/2;
			oGraphic.zoom({since: nNewSince, until: nNewUntil});
		});

		oChart.aFunctions = []; //this variable will store data of all functions in chart
		oGraphic.addFunction = function(aParamData, oConfig){
			var oFunction = {
				data: [],
				occurrences: [],
				id: _uid(),
				config: oConfig
			};
			oChart.aFunctions.push(oFunction);
			_addNewData(oFunction, aParamData);
			_refreshChartInfo(); //restart zoom
			_drawCharts();
			return oFunction.id;
		};
		oGraphic.addListener = function(sEvent, fnCallBack){
			oMediator.subscribe(sEvent, fnCallBack);
		};
		oGraphic.zoom = function(oRange){
			oChart.since = oRange.since;
			oChart.until = oRange.until;
			var aMax = [], aMin = [];
			var fnFilterValue = function(oVal){
				return oVal.date >= oChart.since && oVal.date <= oChart.until;
			};
			for (var i = 0; i < oChart.aFunctions.length; i++) {
				aMax.push(_getMax(oChart.aFunctions[i].data.filter(fnFilterValue), 'value'));
				aMin.push(_getMin(oChart.aFunctions[i].data.filter(fnFilterValue), 'value'));
			}
			oChart.max = _getMax(aMax) || oChart.max;
			oChart.min = _getMax(aMin) || oChart.min;
			if (oChart.max <= oChart.min) {
				console.error('Error while zooming the chart.');
				oChart.min = -1;
				oChart.max = 1;
			}
			_drawCharts();
		};
		oGraphic.addNewData = function(aNewData, sFunctionId){
			//debugger;
			for (var i = 0; i < oChart.aFunctions.length; i++) { //search oFunction
				if(oChart.aFunctions[i].id === sFunctionId){
					_addNewData(oChart.aFunctions[i], aNewData);
				}
			}
			_drawCharts();
		};
		oGraphic.addOccurrences = function(aOccurrences, sFunctionId){
			for (var i = 0; i < oChart.aFunctions.length; i++) { //search oFunction
				if(oChart.aFunctions[i].id === sFunctionId){
					_addNewOccurrences(oChart.aFunctions[i], aOccurrences);
				}
			}
			_drawCharts();
		};
		oMediator.subscribe('select', function(oRange){oGraphic.zoom(oRange);}); //zoom automatic when select
		return oGraphic;
	};
	return function(sDivId){return new Graphic(sDivId);};
})();


var oMediator = oMediator || (function(){
	var nId = 0;
	var oTopics = {}; // Storage for topics that can be broadcast or listened to

	// Subscribe to a topic, supply a callback to be executed
	// when that topic is broadcast to
	var _subscribe = function( sTopic, fn ){
		if ( !oTopics[sTopic] ){ 
			oTopics[sTopic] = [];
		}
		oTopics[sTopic].push({ 'id': nId++, context: this, callback: fn });
		return nId;
	};

	var _unsubscribe = function(numId){
		var sProp, i;
		for (sProp in oTopics){
			if (oTopics.hasOwnProperty(sProp)){
				for (i = oTopics[sProp].length - 1; i >= 0; i--) {
					if (numId === oTopics[sProp][i].id){
						return oTopics[sProp].splice(i, 1);
					}
				}
			}
		}
	};

	// Publish/broadcast an event to the rest of the application
	var _publish = function( sTopic ){
		var args, l, i;
		if ( !oTopics[sTopic] ){
			return false;
		}
		args = Array.prototype.slice.call( arguments, 1 );
		for (i = 0, l = oTopics[sTopic].length; i < l; i++ ) {
			var subscription = oTopics[sTopic][i];
			subscription.callback.apply( subscription.context, args );
		}
		return this;
	};

	return {
		publish: _publish,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe,
		installTo: function( obj ){
			obj.subscribe = _subscribe;
			obj.publish = _publish;
		}
	};
})();
