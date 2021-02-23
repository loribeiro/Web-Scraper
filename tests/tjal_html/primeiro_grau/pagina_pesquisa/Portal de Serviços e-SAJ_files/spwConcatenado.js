
/*
 * Versão: 4.3.3-16
 *
 */

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var resourceMap = resourceMap || { getResource: function(key) { return key; } };

org_apache_myfaces_DateFormatSymbols = function()
{
 this.eras = new Array('BC', 'AD');
 this.months = new Array('January', 'February', 'March', 'April',
 'May', 'June', 'July', 'August', 'September', 'October',
 'November', 'December', 'Undecimber');
 this.shortMonths = new Array('Jan', 'Feb', 'Mar', 'Apr',
 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
 'Nov', 'Dec', 'Und');
 this.weekdays = new Array('Sunday', 'Monday', 'Tuesday',
 'Wednesday', 'Thursday', 'Friday', 'Saturday');
 this.shortWeekdays = new Array('Sun', 'Mon', 'Tue',
 'Wed', 'Thu', 'Fri', 'Sat');
 this.ampms = new Array('AM', 'PM');
 this.zoneStrings = new Array(new Array(0, 'long-name', 'short-name'));
 var threshold = new Date();
 threshold.setYear(threshold.getYear()-80);
 this.twoDigitYearStart = threshold;
}

org_apache_myfaces_SimpleDateFormatParserContext = function()
{
 this.newIndex=0;
 this.retValue=0;
 this.year=0;
 this.ambigousYear=false;
 this.month=0;
 this.day=0;
 this.dayOfWeek=0;
 this.hour=0;
 this.min=0;
 this.sec=0;
 this.ampm=0;
 this.dateStr="";
}

org_apache_myfaces_SimpleDateFormat = function(pattern, dateFormatSymbols)
{
 this.pattern = pattern;
 this.dateFormatSymbols = dateFormatSymbols ? dateFormatSymbols :
 new org_apache_myfaces_DateFormatSymbols();
}
org_apache_myfaces_SimpleDateFormat.prototype._handle = function(dateStr, date, parse)
 {
 var patternIndex = 0;
 var dateIndex = 0;
 var commentMode = false;
 var lastChar = 0;
 var currentChar=0;
 var nextChar=0;
 var patternSub = null;

 var context = new org_apache_myfaces_SimpleDateFormatParserContext();

 if(date != null)
 {
 context.year = this._fullYearFromDate(date.getYear());
 context.month = date.getMonth();
 context.day = date.getDate();
 context.dayOfWeek = date.getDay();
 context.hour = date.getHours();
 context.min = date.getMinutes();
 context.sec = date.getSeconds();
 }

 while (patternIndex < this.pattern.length)
 {
 currentChar = this.pattern.charAt(patternIndex);

 if(patternIndex<(this.pattern.length-1))
 {
 nextChar = this.pattern.charAt(patternIndex+1);
 }
 else
 {
 nextChar = 0;
 }


 if (currentChar == '\'' && lastChar!='\\')
 {
 commentMode = !commentMode;
 patternIndex++;
 }
 else
 {
 if(!commentMode)
 {
 if (currentChar == '\\' && lastChar!='\\')
 {
 patternIndex++;
 }
 else
 {
 if(patternSub == null)
 patternSub = "";

 patternSub+=currentChar;

 if(currentChar != nextChar)
 {
 this._handlePatternSub(context, patternSub,
 dateStr, dateIndex, parse);

 patternSub = null;

 if(context.newIndex<0)
 break;

 dateIndex = context.newIndex;
 }

 patternIndex++;
 }
 }
 else
 {
 if(parse)
 {
 if(this.pattern.charAt(patternIndex)!=dateStr.charAt(dateIndex))
 {
 //invalid character in dateString
 return null;
 }
 }
 else
 {
 context.dateStr+=this.pattern.charAt(patternIndex);
 }

 patternIndex++;
 dateIndex++;
 }
 }

 lastChar = currentChar;
 }

 this._handlePatternSub(context, patternSub,
 dateStr, dateIndex, parse);

 return context;
 };

org_apache_myfaces_SimpleDateFormat.prototype.parse = function(dateStr)
 {
 if(!dateStr || dateStr.length==0)
 return null;

 var context = this._handle(dateStr, null, true);

 if(context.retValue==-1)
 return null;

 this._adjustTwoDigitYear(context);

 return this._createDateFromContext(context);
 };
org_apache_myfaces_SimpleDateFormat.prototype._createDateFromContext=function(context)
 {
 return new Date(context.year, context.month,
 context.day,context.hour,context.min,context.sec);
 };
org_apache_myfaces_SimpleDateFormat.prototype.format = function(date)
 {
 var context = this._handle(null, date, false);

 return context.dateStr;
 };

org_apache_myfaces_SimpleDateFormat.prototype._parseString = function(context, dateStr, dateIndex, strings)
 {
 var fragment = dateStr.substr(dateIndex);
 var index = this._prefixOf(strings, fragment);
 if (index != -1) {
 context.retValue = index;
 context.newIndex = dateIndex + strings[index].length;
 return context;
 }

 context.retValue=-1;
 context.newIndex=-1;
 return context;
 };

org_apache_myfaces_SimpleDateFormat.prototype._parseNum = function(context, dateStr, posCount, dateIndex)
 {
 for(var i=Math.min(posCount,dateStr.length-dateIndex);i>0;i--)
 {
 var numStr = dateStr.substring(dateIndex,dateIndex+i);

 context.retValue = this._parseInt(numStr);

 if(context.retValue == -1)
 continue;

 context.newIndex = dateIndex+i;
 return context;
 }

 context.retValue = -1;
 context.newIndex = -1;
 return context;
 };

org_apache_myfaces_SimpleDateFormat.prototype._handlePatternSub = function(context, patternSub, dateStr, dateIndex, parse)
 {
 if(patternSub==null || patternSub.length==0)
 return;

 if(patternSub.charAt(0)=='y')
 {
 if(parse)
 {
 /* XXX @Arvid: whatever we do, we need to try to parse
 the full year format - length means nothing for
 parsing, only for formatting, so says SimpleDateFormat javadoc.
 only if we run into problems as there are no separator chars, we
 should use exact length parsing - how are we going to handle this?

 Additionally, the threshold was not quite correct - it needs to
 be set to current date - 80years...

 this is done after parsing now!

 if (patternSub.length <= 3) {
 this._parseNum(context, dateStr,2,dateIndex);
 context.year = (context.retValue < 26)
 ? 2000 + context.retValue : 1900 + context.retValue;
 } else {
 this._parseNum(context, dateStr,4,dateIndex);
 context.year = context.retValue;
 }*/
 this._parseNum(context, dateStr,4,dateIndex);

 if((context.newIndex-dateIndex)<4)
 {
 context.year = context.retValue+1900;
 context.ambigousYear = true;
 }
 else
 {
 context.year = context.retValue;

 }
 }
 else
 {
 this._formatNum(context,context.year,patternSub.length <= 3 ? 2 : 4,true);
 }
 }
 else if(patternSub.charAt(0)=='M')
 {
 if(parse)
 {
 if (patternSub.length == 3) {
 var fragment = dateStr.substr(dateIndex, 3);
 var index = this._indexOf(this.dateFormatSymbols.shortMonths, fragment);
 if (index != -1) {
 context.month = index;
 context.newIndex = dateIndex + 3;
 }
 } else if (patternSub.length >= 4) {
 var fragment = dateStr.substr(dateIndex);
 var index = this._prefixOf(this.dateFormatSymbols.months, fragment);
 if (index != -1) {
 context.month = index;
 context.newIndex = dateIndex + this.dateFormatSymbols.months[index].length;
 }
 } else {
 this._parseNum(context, dateStr,2,dateIndex);
 context.month = context.retValue-1;
 }
 }
 else
 {
 if (patternSub.length == 3) {
 context.dateStr += this.dateFormatSymbols.shortMonths[context.month];
 } else if (patternSub.length >= 4) {
 context.dateStr += this.dateFormatSymbols.months[context.month];
 } else {
 this._formatNum(context,context.month+1,patternSub.length);
 }
 }
 }
 else if(patternSub.charAt(0)=='d')
 {
 if(parse)
 {
 this._parseNum(context, dateStr,2,dateIndex);
 context.day = context.retValue;
 }
 else
 {
 this._formatNum(context,context.day,patternSub.length);
 }
 }
 else if(patternSub.charAt(0)=='E')
 {
 if(parse)
 {
 // XXX dayOfWeek is not used to generate date at the moment
 if (patternSub.length <= 3) {
 var fragment = dateStr.substr(dateIndex, 3);
 var index = this._indexOf(this.dateFormatSymbols.shortWeekdays, fragment);
 if (index != -1) {
 context.dayOfWeek = index;
 context.newIndex = dateIndex + 3;
 }
 } else {
 var fragment = dateStr.substr(dateIndex);
 var index = this._prefixOf(this.dateFormatSymbols.weekdays, fragment);
 if (index != -1) {
 context.dayOfWeek = index;
 context.newIndex = dateIndex + this.dateFormatSymbols.weekdays[index].length;
 }
 }
 }
 else
 {
 if (patternSub.length <= 3) {
 context.dateStr += this.dateFormatSymbols.shortWeekdays[context.dayOfWeek];
 } else {
 context.dateStr += this.dateFormatSymbols.weekdays[context.dayOfWeek];
 }
 }
 }
 else if(patternSub.charAt(0)=='H' ||
 patternSub.charAt(0)=='h')
 {
 if(parse)
 {
 this._parseNum(context, dateStr,2,dateIndex);
 context.hour = context.retValue;
 }
 else
 {
 this._formatNum(context,context.hour,patternSub.length);
 }
 }
 else if(patternSub.charAt(0)=='m')
 {
 if(parse)
 {
 this._parseNum(context, dateStr,2,dateIndex);
 context.min = context.retValue;
 }
 else
 {
 this._formatNum(context,context.min,patternSub.length);
 }
 }
 else if(patternSub.charAt(0)=='s')
 {
 if(parse)
 {
 this._parseNum(context, dateStr,2,dateIndex);
 context.sec = context.retValue;
 }
 else
 {
 this._formatNum(context,context.sec,patternSub.length);
 }
 }
 else if(patternSub.charAt(0)=='a')
 {
 if(parse)
 {
 this._parseString(context, dateStr,dateIndex,this.dateFormatSymbols.ampms);
 context.ampm = context.retValue;
 }
 else
 {
 context.dateStr += this.dateFormatSymbols.ampms[context.ampm];
 }
 }
 else
 {
 if(parse)
 {
 context.newIndex=dateIndex+patternSub.length;
 }
 else
 {
 context.dateStr+=patternSub;
 }

 }
 };

org_apache_myfaces_SimpleDateFormat.prototype._formatNum = function (context, num, length, ensureLength)
 {
 var str = num+"";

 while(str.length<length)
 str="0"+str;

 // XXX do we have to distinguish left and right 'cutting'
 //ensureLength - enable cutting only for parameters like the year, the other
 if (ensureLength && str.length > length) {
 str = str.substr(str.length - length);
 }

 context.dateStr+=str;
 };

 // perhaps add to Array.prototype
org_apache_myfaces_SimpleDateFormat.prototype._indexOf = function (array, value)
 {
 for (var i = 0; i < array.length; ++i) {
 if (array[i] == value) {
 return i;
 }
 }
 return -1;
 };

org_apache_myfaces_SimpleDateFormat.prototype._prefixOf = function (array, value)
 {
 for (var i = 0; i < array.length; ++i) {
 if (value.indexOf(array[i]) == 0) {
 return i;
 }
 }
 return -1;
 };

org_apache_myfaces_SimpleDateFormat.prototype._parseInt = function(value)
 {
 var sum = 0;

 for(var i=0;i<value.length;i++)
 {
 var c = value.charAt(i);

 if(c<'0'||c>'9')
 {
 return -1;
 }
 sum = sum*10+(c-'0');
 }

 return sum;
 };
org_apache_myfaces_SimpleDateFormat.prototype._fullYearFromDate = function(year)
 {

 var yearStr = year+"";

 if (yearStr.length < 4)
 {
 return year+1900;
 }

 return year;
 };
org_apache_myfaces_SimpleDateFormat.prototype._adjustTwoDigitYear = function(context)
 {

 if(context.ambigousYear)
 {
 var date = this._createDateFromContext(context);
 var threshold = this.dateFormatSymbols.twoDigitYearStart;

 if(date.getTime()<threshold.getTime())
 context.year += 100;
 }
 };
 //exibe ou esconde o menu lateral, se esta aberto esconde, se esta escondido abre.
function A_showMenuLateral(obj){
	var framesetContent = parent.document.getElementById("frameContent");
	var imgSeta;
	var frameBottom = parent.document.getElementById("frameBottom");
	if(frameBottom.contentDocument){
		//firefox
		imgSeta = frameBottom.contentDocument.getElementById("seta");
	}else{
		//explorer
		imgSeta = parent.document.frames["frameBottom"].document.getElementById("seta");
	}
	var srcSeta = new String(imgSeta.src);
	var posBarra = srcSeta.lastIndexOf("/");
	if(framesetContent.cols != "0,*"){
		framesetContent.setAttribute("colsContentMenuAberto", new String(framesetContent.cols));
		framesetContent.cols = "0,*";
		imgSeta.src = srcSeta.substr(0, posBarra) + "/setaExpand.gif";
	}else{
		if (jQuery.browser.msie) {
			framesetContent.cols = '190,*';
		} else {
			framesetContent.cols = framesetContent.getAttribute("colsContentMenuAberto");
		}
		imgSeta.src = srcSeta.substr(0, posBarra) + "/setaContract.gif";
	}
}

// Verifica se o menu esta aberto
function A_menuLateralEstaAberto(){
	var framesetContent = parent.document.getElementById("frameContent");
	return (framesetContent.cols != "0,*");
}

// Abre o menu somente se ele estiver fechado, se estiver aberto n�o faz nada
function A_abreMenuLateral(){
	if(!A_MenuLateralEstaAberto()){
		A_showMenuLateral(null)
	}
}

// Fecha o menu somente se ele estiver aberto, se estiver fechado n�o faz nada
function A_fechaMenuLateral(){
	if(A_MenuLateralEstaAberto()){
		A_showMenuLateral(null)
	}
}

//teclas de atalho
function A_ShortCut(evento){
	if(evento.ctrlKey){
		tecla = evento.keyCode
		//window.status = tecla

		//M - contract/expand menu side
		if(tecla == 77){
			A_changeLateralSize()
		}
	}
}

function destacaSelecionado(obj) {
	jQuery(".menuText-selecionado").removeClass("menuText-selecionado");
	jQuery(obj).addClass("menuText-selecionado");
}

//coloca o texto no caminho quando o menu � clicado
function A_writeInPath(obj){

	destacaSelecionado(obj);
	//pega o texto

	var jObj = jQuery(obj);
	var textPath = jObj.text();
	var nivel = jObj.attr("nivel");
	while(nivel > 0) {
		jObj = jObj.parents(".nivel"+(nivel-1));
		textPath = jObj.find(".menuTextPrinc").eq(0).text() + " > " + textPath;
		nivel = nivel - 1;
	}


	//coloca no caminho
	frameSuperior = parent.window.frames["superior"]
	objPath = frameSuperior.document.getElementById("path")
	objPath.childNodes[0].nodeValue = textPath

}







avisosCriticosModalOpacity = 0.5;
var avisosList;

function createMuralAvisosCriticos(){
	avisosList = top.index.inferior.avisosList;

	var ul = document.getElementById("listaAvisosCriticos");
    if(avisosList==null){
    	fecharConsultaModalById('');
    	return;
    }

	for(var i = 0; avisosList[(""+i)]; i++){
        var li = document.createElement("li");
        var cb = document.createElement("input");
        cb.setAttribute("type","checkbox");
        if (jQuery.browser.msie) {
        	cb.attachEvent("onclick", function(event){eval("saveHandler(event);")});
	    }else{
	    	cb.setAttribute("onclick", "saveHandler(event)");
	    }

        cb.setAttribute("name","avisosCriticosMarcadosString["+i+"]");
        cb.setAttribute("value", avisosList[(""+i)]["nuSeqAviso"] + "_:_" + avisosList[(""+i)]["avisoproviderName"] );

        var label = document.createElement("a");
        var divId = 'mensagem'+i;

        jQuery(label).click(function(event){toogleSiblingDiv(event)});

        var div = document.createElement("div");
        div.id = divId;
        div.style.display = "none";

        var tarea = document.createElement("p");
        var cbArea = document.createElement("p");
        cbArea.style.color="red";


        var assunto = document.createTextNode(avisosList[(""+i)]["deAssunto"]);
        var mensagem = document.createTextNode(avisosList[(""+i)]["deMensagem"]);
        var marcarComoLido = document.createTextNode("Marcar como lido");

        tarea.appendChild(mensagem);
        label.appendChild(assunto);

        cbArea.appendChild(cb);
        cbArea.appendChild(marcarComoLido);

        div.appendChild(tarea);
        div.appendChild(cbArea);

        li.appendChild(label);
        li.appendChild(div);

        ul.appendChild(li);

    }
	//i=0;
	top.index.inferior.avisosList = null;

}
function toogleSiblingDiv(event){
	if ( !event.target )
		event.target = event.srcElement
	var $this = event.target;
	jQuery($this).parent().children("div").toggle(300);
}
function saveHandler(event){
	if ( !event.target )
		event.target = event.srcElement
	var $this = event.target;
	var $a = jQuery($this).parent().parent().parent().children("a");
	if($a.hasClass("avisoLido")){
		$a.removeClass("avisoLido");
	}
	else{
		$a.addClass("avisoLido");
	}
	var botaoSalvar = jQuery(":submit");
	var checkboxesNaoChecados = jQuery(":checkbox:not(:checked)");
	if(checkboxesNaoChecados.length==0)
		botaoSalvar.removeAttr("disabled");
	else
		botaoSalvar.attr("disabled" , "disabled");

}
function fecharConsultaModalById(id) {
    //onclosewindow();
	removeSpwModalAvisosCriticos();
    var idIframe = "spwAvisoCritico"+id;
    layerCon = parent.document.getElementById(idIframe);
    var doc = parent.document;
    if (layerCon == null) {
       layerCon = document.getElementById(idIframe);
       doc = document;
    }
    if (layerCon != null) {
      layerCon.parentNode.removeChild(layerCon);
      objBody = doc.getElementsByTagName("BODY")[0];
      objBody.onmouseup = null;
      objBody.onmousemove = null;
    }
}

/** Cria a caixa de consulta **/
function abrirModalAviso(url, largura, altura, avisos){
	var frame = getFrameForModal();
	var documentAux = frame.document;
    if(documentAux.getElementById("spwAvisoCritico") != null /*&& verificaIframeDiv()*/) {
       return;
    }

	//busca o frame que pode receber o modal.

	avisosList = avisos;
    alturaTitulo = 18;
    var idIframe = '';
    var idIframeConcat = "spwAvisoCritico";
    //verifica se a consulta ja esta aberta(default -> spwConsulta e caso n�o tenha verifica quaquer div que contenha spwConsulta)

    spwModalAvisosCriticos();
    //pega dados da pag
    objBody = documentAux.getElementsByTagName("BODY")[0];
    alturaPag = objBody.clientHeight;
    larguraPag = objBody.clientWidth;
    posScroll = objBody.scrollTop;
    //cria a layer
    var laConsulta = documentAux.createElement("DIV");
    laConsulta.id = idIframeConcat;
    laConsulta.style.position = "absolute";
    laConsulta.style.width = largura+"px";
    laConsulta.style.height = altura+"px";
    var left = (larguraPag - largura) / 2;
    var top = (alturaPag - altura) / 2 + posScroll;
    if(left<=25)
    	left = 50;
    if(top<=0)
    	top = 55;
    laConsulta.style.left = left + "px";
    laConsulta.style.top = top + "px";
    //laConsulta.className = "spwTabelaGrid";
    laConsulta.style.backgroundColor = "#FFFFFF";
    laConsulta.style.zIndex = 9009;
    laConsulta.style.border ="1px solid";
    objBody.appendChild(laConsulta);

    //cria a tabela superior
    tabelaCons = documentAux.createElement("TABLE");
    tabelaCons.cellPadding = 0;
    tabelaCons.cellSpacing = 0;
    tabelaCons.style.width = '100%';
    tabelaCons.className = "spwTituloModal";
    cabCons = documentAux.createElement("TBODY");
    tabelaCons.appendChild(cabCons);

    //cria a linha da tabela
    linhaCons = documentAux.createElement("TR");
    cabCons.appendChild(linhaCons);

    //cria a primeira celula
    celula1Cons = documentAux.createElement("TD");
    celula1Cons.height = alturaTitulo;
    linhaCons.appendChild(celula1Cons);
    texto1 = documentAux.createTextNode("Avisos Cr�ticos");
    celula1Cons.appendChild(texto1);
    objBody.onmousemove = moverLayerModal;
    celula1Cons.onmousedown = iniciaMoverModal;
    objBody.onmouseup = terminaMoverModal;

    //cria a segunda celula
    celula2Cons = documentAux.createElement("TD");
    linhaCons.appendChild(celula2Cons);

    celula2Cons.style.width = '20px';
    laConsulta.appendChild(tabelaCons);

    //cria tabela para conter o iframe
    tabelaIframe = documentAux.createElement("TABLE");
    linhaIframe = documentAux.createElement("TR");
    celulaIframe = documentAux.createElement("TD");
    tabelaIframe.id = "tabelaIframe";

    if (url.indexOf("?") < 0) {
        url=url+"?";
    } else {
        url=url+"&";
    }
    if( navigator.appName == "Netscape" ) {
        iframeConsulta = documentAux.createElement("iframe");
        iframeConsulta.src = url;
        iframeConsulta.width = "100%";
        iframeConsulta.height = altura - alturaTitulo;
        iframeConsulta.frameBorder = "0";
        iframeConsulta.id = "layerFormConsulta";
        laConsulta.appendChild(iframeConsulta);
    } else {
        htmlIframe = "<iframe id='layerFormConsulta' frameBorder='0' style='width:100%; height:100%' src='"+url+"'></iframe>";
        documentAux.getElementById(idIframeConcat).insertAdjacentHTML("beforeEnd", htmlIframe);
    }
}
function getFrameForModal(){
	if(top.index.page.length<=1)
		return top.index.page;
	else if(top.index.page.avisosFrame!=undefined)
		return top.index.page.avisosFrame;
	else{
		//busca por um frame com a variavel modal
		getFrameComVariavelModal();
	}
}
function getFrameComVariavelModal(){
	//Implementar de acordo com a necessidade de cada projeto.
	//alert("Aviso");
}
function iniciaMoverModal(aEvent){
	var frame = getFrameForModal();

    var documentAux = frame.document;
    var windowAux = frame.window;
    var theEvent = aEvent ? aEvent : windowAux.event ;
    movendo = true;
    posXinicial = new Number(theEvent.clientX + documentAux.body.scrollLeft);
    posYinicial = new Number(theEvent.clientY + documentAux.body.scrollTop);
    layerConsulta = documentAux.getElementById("spwAvisoCritico");
    posXlayer = converteNumero(layerConsulta.style.left);
    posYlayer = converteNumero(layerConsulta.style.top);
}

/** exibe o conteudo da consulta quanto termina de mover **/
function terminaMoverModal(){
	var frame = getFrameForModal();
    var documentAux = frame.document;
    documentAux.getElementById("layerFormConsulta").style.display = "";
    movendo = false;
}

/** move a layer **/
function moverLayerModal(aEvent){
	var frame = getFrameForModal();
    var documentAux = frame.document;
    var windowAux = frame.window;
    var theEvent = aEvent ? aEvent : windowAux.event;
    if (movendo == true) {
        documentAux.getElementById("layerFormConsulta").style.display = "none";
        currentX = new Number(theEvent.clientX + documentAux.body.scrollLeft);
        currentY = new Number(theEvent.clientY + documentAux.body.scrollTop);
        layerConsulta = documentAux.getElementById("spwAvisoCritico");
        layerConsulta.style.left = posXlayer + (currentX - posXinicial) + "px";
        layerConsulta.style.top = posYlayer + (currentY - posYinicial) + "px";
    }
}

function spwModalAvisosCriticos(){
	jQuery(document).ready(function() {
	    var $docTop = jQuery(top.index.frames['superior'].document);
		var $divTopModal = $docTop.find('#avisoCriticoTopModal');

		$divTopModal.addClass("avisoCriticoModal");
	    $divTopModal.fadeTo(0, avisosCriticosModalOpacity, function() {
	    	$divTopModal.show();
	    });

	    var $docBotton = jQuery(top.index.frames['inferior'].document);
		var $divBottonModal = $docBotton.find('#avisoCriticoBottonModal');

		$divBottonModal.addClass("avisoCriticoModal");
	    $divBottonModal.fadeTo(0, avisosCriticosModalOpacity, function() {
	    	$divBottonModal.show();
	    });

		var $docMenu = jQuery(top.index.frames['menu'].document);
		var $divMenuModal = $docMenu.find('#avisoCriticoMenuModal');

		$divMenuModal.addClass("avisoCriticoModal");
	    $divMenuModal.fadeTo(0, avisosCriticosModalOpacity, function() {
	    	$divMenuModal.show();
	    });

    	//Tem que ter o document sem jquery pois em alguns casos o jquery se perde e d� erro ao fazer $docPage.width()

	    if(top.index.page.length>1){
	    	for(var i=0; i<top.index.page.length ; i++){
	    		setModalForADocument(top.index.page[i]);
	    	}
	    }
	    else{
	    	setModalForADocument(top.index.page);
	    }
	});
}


function setModalForADocument(frame){
	var docPage = frame.document;
	var frameWindow = frame.window;
	if(docPage == null || docPage == undefined || docPage == "undefined"){
		docPage = window.parent.frames['page'].document;
	}
    var $docPage = jQuery(docPage);
    var $pageBody = $docPage.find('body');
    $pageBody.append("<div id='avisoCriticoPageModal'></div>");
    var $divPageModal = $docPage.find('#avisoCriticoPageModal');
    $divPageModal.addClass("avisoCriticoModal");

    var docWidth = getDivPageModalWidth($docPage,docPage);
    var docHeight = getDivPageModalHeight($docPage,docPage);

    $divPageModal.css({'width':docWidth,'height':docHeight});
    $divPageModal.fadeTo(0, avisosCriticosModalOpacity, function() {
    	$divPageModal.show();
    });

    jQuery(window).resize(function() {
		if($divPageModal != null && $divPageModal.size() > 0){
		    var docWidth = getDivPageModalWidth($docPage,docPage);
    		var docHeight = getDivPageModalHeight($docPage,docPage);
			$divPageModal.css({'width':docWidth,'height':docHeight});
	    }
	});


}

function getDivPageModalHeight($docPage,docPage){
    var docHeight;
    try{
		if(isNaN($docPage.height())){
	   		throw 'NaN';
	   	}
	   	docHeight = $docPage.height() + 'px';
	}catch(err){
	   	try{
	   		if(isNaN(docPage.height)){
	   			throw 'NaN';
	   		}
		    //docHeight = (docPage.height) + 30 + 'px';
	   		docHeight = getDocHeight(docPage);
	   	}catch(err){
   			docHeight = '100%';
		}
    }

    return docHeight;
}

function getDivPageModalWidth($docPage,docPage){
	var docWidth;
    try{
    	if(isNaN($docPage.width())){
    		throw 'NaN';
    	}
    	docWidth = $docPage.width() + 'px';
    }catch(err){
    	try{
    		if(isNaN(docPage.width)){
    			throw 'NaN';
    		}
    		docWidth = (docPage.width) + 30 + 'px';
    	}catch(err){
    		try{
    			docWidth = docWidth = getDocWidth(docPage);
    		}catch(err){
    			docWidth = '100%';
    		}
    	}
    }

    return docWidth;
}

function getDocHeight(D) {
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

function getDocWidth(D) {
    return Math.max(
        Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
        Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
        Math.max(D.body.clientWidth, D.documentElement.clientWidth)
    );
}

function removeSpwModalAvisosCriticos(){
	    var $docTop = jQuery(top.index.frames['superior'].document);
		var $divTopModal = $docTop.find('#avisoCriticoTopModal');
		if($divTopModal != null && $divTopModal.size() > 0){
	    	$divTopModal.hide();
	    }

	    var $docBotton = jQuery(top.index.frames['inferior'].document);
		var $divBottonModal = $docBotton.find('#avisoCriticoBottonModal');
		if($divBottonModal != null && $divBottonModal.size() > 0){
	    	$divBottonModal.hide();
	    }

		var $docMenu = jQuery(top.index.frames['menu'].document);
		var $divMenuModal = $docMenu.find('#avisoCriticoMenuModal');
		if($divMenuModal != null && $divMenuModal.size() > 0){
	    	$divMenuModal.hide();
	    }
		if(top.index.page.length>1){
	    	for(var i=0; i<top.index.page.length ; i++){
	    		removeModalFromFrame(top.index.page[i].document);
	    	}
	    }
	    else{
	    	removeModalFromFrame(top.index.page.document);
	    }
	    jQuery(window).unbind('resize');
}
function removeModalFromFrame(docPage){
	var $docPage = jQuery(docPage);
    var $divPageModal = $docPage.find('#avisoCriticoPageModal');
    if($divPageModal != null && $divPageModal.size() > 0){
    	$divPageModal.hide();
    }
}/**
 * Troca o estilo do botao por o nome do estilo + '-o'
 */
function B_mOver(obj)
{
   //obj.style.cursor = "hand";
   var nmStyle = new String(obj.className);
   if(obj.className.indexOf("-o") == -1){
	   obj.className = nmStyle + "-o";
   }
}

/**
 * Troca o estilo do botao por o nome do estilo - '-o'
 */
function B_mOut(obj)
{
   var nmStyle = new String(obj.className);
   if(obj.className.indexOf("-o") > -1){
	   obj.className = nmStyle.substr(0, nmStyle.length - 2);
   }
}

function B_desabilitaBotao(obj){
	var objType = obj.type;
	var objClassName = obj.className;
	if (obj.nodeName == "INPUT" && (objType == "button" || objType=="submit")) {
		if(objClassName.indexOf('-o') != -1){
			obj.setAttribute('oldClassName',objClassName);
			obj.className = objClassName.substring(0,objClassName.length-2) + '-d';
		}else if(objClassName.indexOf('-d') == -1){
			obj.setAttribute('oldClassName',objClassName);
			obj.className = objClassName + '-d';
		}
		obj.disabled = true;
	}
}

function B_submitTo(action) {
	document.forms[0].action = action;
	document.forms[0].submit();
}

function B_setLocation(action) {
	F_openPage(action);
}
/**
 * Verifica se os campos do formul�rio s�o v�lidos
 */
function BENV_isCamposValidos(objForm) {
	//Varre o formul�rio procurando por campos obrigat�rios
	var elementosParaDesabilitar = new Array();
	var cn_array = new Array();
	var length = objForm.length;
	for (var iCampo=0;iCampo<length;iCampo++) {
		var obj = objForm[iCampo];
		//procura por elementos que precisam ser desabilitados no submit
		if(new String(obj.getAttribute('desabilitaOnSubmit')).toUpperCase() == "TRUE"){
			elementosParaDesabilitar.push(obj);
		}
		var objName = obj.name;
        //verifica se n�o � a linha -1 da grid
    	if (objName != "" && objName != "null")  {
			//Verifica se n�o est� com readonly ou disabled..
		    if(obj.getAttribute('disabled') == null && obj.getAttribute('readonly') == null && jQuery(obj).is(':visible')){
	            //Faz a valida��o do campo

		    	//verifica se o registro foi excluido.
            	var isExcluido = false;
				var grid = getGrid(obj);
				if(grid != null){
					var index = getFieldIndex(obj.id);
					var idAcao = getColumnId(grid, "status", index);
					var acao = document.getElementById(idAcao);
					if (acao != null) {
						var acaoValue = new String(acao.value);
						isExcluido = (acaoValue.indexOf('D') != -1);
					}
				}

				var isObrigatorio = new String(obj.getAttribute('obrigatorio')).toUpperCase() == "TRUE";

				if (!isExcluido && (isObrigatorio || obj.value != '')) {
		            if (!C_verificaValor(obj)) {
	            		if(obj.offsetHeight != 0 || C_exibeDivSubtitleCampo(obj)){
					    	obj.focus();
					    }
	            		var formatType = obj.getAttribute('formatType');
	            		exibeMensagem(formatType, obj);
	            		return false;
	        		}
				}

	            if (isObrigatorio) {
					//verifica se o campo faz parte da chave prim�ria
					var pk = obj.getAttribute('pk');
					var isPk = false;
					if(pk != null){
						isPk = (new String(pk).toUpperCase() == "TRUE");
					}
					//Verifica se o valor do campo � valido
					//Verifica se o campo est� preenchido
	                if(!isExcluido || isPk){
						if (!C_verificaObrigatorio(obj)) {
							return false;
						}
	    	        }
	            }
	        }

	        //Verifica se � necess�rio a desformata��o do campo num�rico e adiciona o objeto ao array
        	if(new String (obj.getAttribute('formatType')).toUpperCase() == 'NUMBER' && new String (obj.getAttribute('desformataOnSubmit')).toUpperCase() == "TRUE"){
        		cn_array.push(obj);
        	}

        }
	}

	// hook method
	if (!BENV_validaForm()) {
		return false;
	}

	//Verifica se tem campos num�ricos a serem desformatados
	if(cn_array != null && cn_array.length > 0){
		desformataCn_array(cn_array);
	}

	//concatena o dia(first ou last) nas datas da tag formatedDate e verifica se o intervalo � v�lido
	if(!verificaFormatedDate(objForm)){
		return false;
	}

	var elementosParaDesabilitarLenght = elementosParaDesabilitar.length;
	for(var i = 0; i < elementosParaDesabilitarLenght; i++){
		var obj = elementosParaDesabilitar[i];
		obj.disabled = true;
	}


	//BENV_exibeProcessando();
    return true;
}

// hook method in BENV_isCamposValidos function for new validations
function BENV_validaForm() {
	return true;
}

function desformataCn_array(array){
	var arrayTamanho = array.length;
	for(var i = 0; i < arrayTamanho; i++){
		array[i].value = CN_getValorDesformatadoDouble(array[i].value);
	}
}

function applySubmit(objForm, apply){
	if(objForm != null){
		var objTarget = objForm.target;
		var tname_lc = new String(objTarget).toLowerCase();
		var isSameWindow = objTarget == "" ||
				tname_lc == "_self" || objTarget == window.name;
		if(apply && isSameWindow){
			FF_desabilitaBotoes(objForm);
		}
	}
	return apply;
}

function exibeMensagem(formatType, input){
	switch(formatType){
		case 'DATE': {
			alert(msgKey("label.js.dataInvalida",input.value));
		    break;
		}
		case 'CPF': {
			alert(msgKey("label.js.cpfInvalido",input.value));
		    break;
		}
		case 'CNPJ': {
			alert(msgKey("label.js.cnpjInvalido",input.value));
		    break;
		}
		case 'EMAIL': {
			alert(msgKey("label.js.emailInvalido",input.value));
		    break;
		}
		case 'NUMBER': {
			alert(msgKey("label.js.valorInvalido",input.value));
		    break;
		}
		case 'MASK': {
			if (input.value.trim.length == 0) {
				alert(msgKey("label.js.campoDevePreenchido",$("label[for='"+input.id+"']").text().replace('*','')));
			} else {
				alert(msgKey("label.js.valorInvalido",input.value));
			}
		    break;
		}
		case 'FORMATEDDATE': {
			alert(msgKey("label.js.dataInvalida",input.value));
		    break;
		}
		case 'INTERVALO': {
			alert(msgKey("label.js.intervaloDatas",input.value));
		    break;
		}

	}
}

/**
 * Evento OnClick
 */
function BENV_CLK(ctrl) {
	//pega o objeto form mais proximo
	//objForm = FF_GetForm(ctrl);
    objClicado = ctrl;
}

/**
 * Exibe a imagem de processando no meio da tela
 */
function BENV_exibeProcessando() {
	var objBody = document.getElementsByTagName("BODY")[0];
	var objLayer = document.createElement("DIV");
	objLayer.className = "processando";

	var alturaPag = document.body.clientHeight;
	var larguraPag = document.body.clientWidth;
	var posScroll = document.body.scrollTop;
	var largura = 200
	var altura = 40

	objLayer.style.left = (larguraPag - largura) / 2;
	objLayer.style.top = (alturaPag - altura) / 2 + posScroll;

	objBody.appendChild(objLayer);
}

function verificaFormatedDate(objForm){
	var componentesAlterados = new Array();
	var length = objForm.length;
	for (var iCampo=0;iCampo<length;iCampo++) {
		var obj = objForm[iCampo];
		var objName = obj.name;
		var objValue = obj.value;
		//concatena o dia desejado � data informada
		if(new String(obj.getAttribute('appendDay')).toUpperCase() == "FIRST" ||
			new String(obj.getAttribute('appendDay')).toUpperCase() == "LAST"){
	       	obj.value = appendDay(objValue, new String(obj.getAttribute('appendDay')).toUpperCase());
	       	componentesAlterados.push(obj);
	    }
		//verifica o intervalo
	    var compareId = obj.getAttribute('compareId');
	    if(new String(compareId) != null && new String(compareId) != ""
		   && new String(compareId) != "null" && new String(obj.getAttribute('formatType')) == "FORMATEDDATE"){
	    	var outroDate = document.getElementById(compareId);
	    	var intervaloValido = verificaIntervaloDatas(new String(outroDate.value), new String(obj.value));
	    	if(!intervaloValido){
	    		var tamanhoComponentesAlterados = componentesAlterados.length;
	    		for(var i=0;i<tamanhoComponentesAlterados;i++){
	    			var componente = componentesAlterados[i];
	    			var componenteValue = componente.value;
	    			if(new String(componenteValue).length == 10 &&
	    				(new String(componente.getAttribute('appendDay')).toUpperCase() == "FIRST" ||
	    				new String(componente.getAttribute('appendDay')).toUpperCase() == "LAST")){
	            		componente.value = new String(componenteValue).substring(3);
	            	}
	    		}
	    		obj.focus();
	    		exibeMensagem("INTERVALO", obj);
	    		return false;
	    	}
	    }
	}
	return true;
}

function verificaIntervaloDatas(dtIni, dtFim){
	if(dtIni.length == 7){
		dtIni = "01/"+dtIni;
	}
	if(dtFim.length == 7){
		dtFim = "01/"+dtFim;
	}
	if(!Date.strToDate(dtIni).before(Date.strToDate(dtFim))){
		return false;
	}
	return true;
}

function decodificaInputMulSelOnSubmit() {
	var objs = jQuery('div[multselecao=true] > input');
	for (i=0; i<objs.length; i++) {
		objs.get(i).value = url_decode(url_decode(objs.get(i).value));
	}
}function BEG_GetImagem(obj, tipo) {
   var srcImg = obj.src;
   var extensao = srcImg.substr(srcImg.length  - 3);
   if (tipo == "aceso") {
       srcImg = srcImg.substr(0, srcImg.length - 8) + "-o." + extensao;
   } else if (tipo == "aceso_deletado") {
       srcImg = srcImg.substr(0, srcImg.length - 6) + "-d-o." + extensao;
   } else if (tipo == "normal") {
       srcImg = srcImg.substr(0, srcImg.length - 6) + "." + extensao;
   } else if (tipo == "normal_deletado") {
       srcImg = srcImg.substr(0, srcImg.length - 4) + "-d." + extensao;
   }
}

/**
 * Executa a exclus�o do registro
 */
function BEG_DeletaRegistro(obj) {
    // Muda a acao da linha
    changeAction(obj, "D")
    //Troca a imagem para a imagem "deletado"
    var srcImg = obj.src;
    var estado = srcImg.substr(srcImg.length - 6);
    if (estado == "-o.gif") {
        var estado2 = srcImg.substr(srcImg.length - 8);
        if (estado2 == "-d-o.gif") {
            mudarCorLinha(obj, "");
            BEG_GetImagem(obj, "aceso");
        } else {
            mudarCorLinha(obj, "");
            BEG_GetImagem(obj, "aceso_deletado");
        }
    } else {
        if (estado == "-d.gif" ) {
            mudarCorLinha(obj, "");
            BEG_GetImagem(obj, "normal");
        } else {
            mudarCorLinha(obj, "");
            BEG_GetImagem(obj, "normal_deletado");
        }
    }
}

/**
 * Evento OnKeyPress
 */
function BEG_KPS(ctrl) {
    BEG_DeletaRegistro(ctrl);
}
var browserControl = new Array();

function isJreVersionValid(minimo){
	if(browserHasJre()){
		var m = minimo;
		var v = '' + getBrowserJreVersion();
		var vLeft = null;
		var mLeft = null;

		v = v.replace('_','.');
		m = m.replace('_','.');
		while(v != null	&& m != null){
			if(m.indexOf('.') != -1){
				var m2 = m;
				var m = m.substring(0,m.indexOf('.'));
				mLeft = m2.substring(m2.indexOf('.')+1, m2.length);
			} else {
				mLeft = null;
			}
			if(v.indexOf('.') != -1){
				v2 = v;
				v = v.substring(0,v.indexOf('.'));
				vLeft = v2.substring(v2.indexOf('.')+1, v2.length);
			} else {
				vLeft = null;
			}
			if(new Number(m) < new Number(v)){
				return true;
			} else if(new Number(m) > new Number(v)){
				return false;
			}
			if(mLeft == null){
				return true;
			}
			if(vLeft == null){
				return false;
			}
			v = vLeft;
			m = mLeft;
		}
	}
	return false;
}

function browserHasJre(){
	return navigator.javaEnabled();
}

function getBrowserJreVersion(){
	return getJreVersion();
}

function getBrowserName(){
	return navigator.appName;
}

function getBrowserVersion(){
	return navigator.userAgent;
}

function checaVersaoJre(versao){
	if(!isJreVersionValid(versao)){
		var p = document.createElement('<P>');
		var msg = document.createTextNode(msgKey('label.js.jreInvalida', ''));
		var objBody = document.getElementsByTagName("BODY")[0];
		objBody.appendChild(msg);
		objBody.appendChild(document.createElement('<BR>'));
		objBody.appendChild(getSolucaoProblemaElement('jreInvalida.html'));
		objBody.appendChild(p);
	}
}

function checaBrowser(){
	if(!isBrowserValid(arguments)){
		var msg = document.createTextNode(msgKey('label.js.browserInvalido', ''));
		var msgLinha2 = document.createTextNode(msgKey('label.js.browsersValidos', ''));
		var objBody = document.getElementsByTagName("BODY")[0];
		objBody.appendChild(document.createElement('<BR>'));
		objBody.appendChild(msg);
		objBody.appendChild(msgLinha2);

		var argumentsTamanho = arguments.length;
		for(var i = 0; i < argumentsTamanho; i+=2){
			objBody.appendChild(document.createElement('<BR>'));
			objBody.appendChild(document.createTextNode(arguments[i] + ' ' + arguments[i+1]));
		}
		objBody.appendChild(document.createElement('<BR>'));
		objBody.appendChild(getSolucaoProblemaElement('browserInvalido.html'));
		objBody.appendChild(document.createElement('<P>'));
	}
}

function isBrowserValid(){
	var browserControl = arguments[0];
	var i = 0;
	var name = getBrowserName();

	//Verifica se � Chrome
	var is_chrome = getBrowserVersion().toLowerCase().indexOf('chrome') > -1;
	if (is_chrome) {
		return true;
	}

	if(name.indexOf('Netscape') == -1 && name.indexOf('Firefox') == -1 &&
					name.indexOf('Microsoft Internet Explorer') ==-1 ){
		return false;
	}
	var version = getBrowserVersion();
	while(i < browserControl.length){
		var bName = browserControl[i++];
		if(name.indexOf(bName) != -1 || version.indexOf(bName)!= -1){
			if(i < browserControl.length){
				var bVersion = browserControl[i++];
				if(version.indexOf('MSIE') != -1){
					v = version.substring(version.indexOf('MSIE')+4, version.indexOf('; Windows'));
				} else {
					v = version.substring(version.indexOf('Firefox/')+8, version.length);
				}
				versaoDoBrowser = trim(v);
				versaoDoBrowser = replaceAll(versaoDoBrowser,'.', '');
				versaoDoBrowser = '0.' + versaoDoBrowser;
				versaoMinima = replaceAll(bVersion,'.','');
				versaoMinima = '0.' + versaoMinima;
				if(versaoDoBrowser >= versaoMinima){
					return true;
				} else {
					return false;
				}
			}
		}
	}
	return false;
}

function checaJavaScript(){
	document.getElementById('checkJavaScript').style.display='none';
	document.getElementById('submit').disabled = false;
}


function getJreVersion() {
    var version = 0;
    try {
        version = JREDetect.getJavaVersion();
    } catch(e) {
		return 0;
    }
    return version;
}

function getSolucaoProblemaElement(link){
	var a = document.createElement('A');
	a.setAttribute('href', link);
	a.setAttribute('target', 'newWindow');
	var label = document.createTextNode(msgKey('label.js.resolverProblema'));
	a.appendChild(label);
	return a;
}
/**
 * Retorna a posi��o do cursor dentro do campo.
 */
function C_getPosTextoDigitado(ctrl) {
  	if (document.selection) {
        ctrl.focus();
        var range = document.selection.createRange();
        return (ctrl.value.length - range.move("character", 50000));
    } else {
        return ctrl.selectionStart;
    }
}

/**
 * Retorna o texto se o caracter "caracter" for digitado na posi��o atual do
 * cursor.
 */
function C_getTextoDigitado(ctrl, caracter) {
  	if (document.selection) {
        ctrl.focus();
        var range = document.selection.createRange();
        var tamSel = String(range.text).length;
        var posIni = (ctrl.value.length - range.move("character", 50000));
        var posFim = posIni + tamSel;
    } else {
        var posIni = ctrl.selectionStart;
        var posFim = ctrl.selectionEnd;
    }
    var textodigitado = ctrl.value.substr(0, posIni) + caracter + ctrl.value.substr(posFim);
    return textodigitado;
}

/*
 * Retorna TRUE se o campo estiver todo selecionado
 */
function C_isCampoTodoSelecionado(ctrl) {
    var tamanhoTextoCampo = String(ctrl.value).length;
  	if (jQuery.browser.msie) {
  		if (document.selection) {
  			var range = document.selection.createRange();
  			return (String(range.text).length == tamanhoTextoCampo);
  		} else {
  			var range = document.getSelection();
  			return range.rangeCount == tamanhoTextoCampo;
  		}
    } else {
        return (ctrl.selectionEnd - ctrl.selectionStart == tamanhoTextoCampo);
    }
}

/*
 * Retorna o tamanho da sele��o no campo
 */
function C_getSelLength(ctrl) {
  	if (jQuery.browser.msie) {
  		if (document.selection) {
  			var range = document.selection.createRange();
  			return range.text.length;
  		} else {
  			var range = document.getSelection();
  			return range.rangeCount;
  		}
    } else {
        return (ctrl.selectionEnd - ctrl.selectionStart);
    }
}

/**
 * Retorna o c�digo da tecla digitada no OnKeyPress, OnKeyDown e OnKeyUp.
 */
function C_TeclaDigitada(event) {
    if (jQuery.browser.msie) {
        return event.keyCode;
    } else {
        return event.charCode;
    }
}

/**
 * Retorna o c�digo da tecla de controle digitada no OnKeyPress, OnKeyDown e OnKeyUp.
 */
function C_TeclaControleDigitada(event) {
    if (jQuery.browser.msie) {
        if (event.type == "keypress") {
            return 0;
        } else {
            return event.keyCode;
        }
    } else {
        return event.keyCode;
    }
}

/**
 * Cancela o evento OnKeyPress, OnKeyDown, OnKeyUp.
 */
function C_CancelaEvento(event) {
    if (jQuery.browser.msie) {
        event.returnValue = false;
    } else {
        event.preventDefault();
    }
}

/**
 * Retorna TRUE se o evento OnKeyPress pode ser processado.
 */
function C_NaoPodeProcessarOnKeyPress(ctrl, event) {
    var tecla = C_TeclaDigitada(event);
    var teclaControle = C_TeclaControleDigitada(event);

    if(!jQuery.browser.msie){
    return (ctrl.readOnly || tecla == 0 || tecla == 13 || event.ctrlKey ||
        event.ctrlLeft);
    }

    return (ctrl.readOnly || tecla == 0 || tecla == 13 || event.ctrlKey ||
        event.ctrlLeft || C_TeclaControleDigitada(event) > 0);
}

/**
 * valida el texto en el formato.
 */
function C_valorTeclasControleHandler(ctrl, event){
	window.setTimeout(function(){
			var formatoAux = ctrl.getAttribute("formato");
			var conteudo = ctrl.value;
			var formattype = ctrl.getAttribute("formattype");
			var formato = "";
			switch(formattype){
			case "DATE":
				conteudo = this.getValidConteudo(conteudo, ctrl);
				if(formatoAux == null || formatoAux == "")
					formato = "00/00/0000";
				else
					formato = formatoAux;
				break;
			case "FORMATEDDATE":
				if(formatoAux == null || formatoAux == "")
					formato = "00/0000";
				else
					formato = formatoAux;
				break;
			case "NUMBER":
				formato = F_strPad("",formatoAux, "0");
				break;
			case "TEXT":
				formato = F_strPad("",formatoAux, "a");
				break
			default:
				formato = formatoAux.toString();
			}

			if(formato && CM_isFormatoValido(formato, conteudo)){
				if (formattype != "TEXT") {
					conteudo=C_limpaConteudoComFormato(formato, conteudo);

					var maskAlign = ctrl.getAttribute("maskAlign");
					ctrl.value=CM_aplicaMascaraAoConteudo(formato, conteudo, maskAlign);
				}
			}
		 }, 200);
}

function getValidConteudo(conteudo, ctrl) {
	var isNonDigitCaracterWithSlash = (conteudo.search(/^\d{1,2}\/\d{1,2}\/\d{1,4}$/) != -1);
	var isNonDigitCaracter = (conteudo.search(/\D/) === -1);
	if (!isNonDigitCaracterWithSlash) {
		if (!isNonDigitCaracter) {
			ctrl.value = "";
			conteudo = "";
			return conteudo;
		}
	}
	return "";
}

/**
 * Retorna TRUE caso seja digitado CRTL+V, CTRL+X, SHIFT+INS
 */
function C_isTeclasControle(ctrl, event){
	var tecla = C_TeclaDigitada(event);
    var teclaControle = C_TeclaControleDigitada(event);
	if ( ((event.ctrlKey || event.ctrlLeft) && (tecla == 86 || tecla == 118 || tecla == 88 || tecla == 120)) ||
            ((event.shiftKey || event.shiftLeft) && (teclaControle == 45 || teclaControle == 46)) ) {
           return true;
       }
	return false
}

/**
 * Retorna TRUE caso as teclas de controle devam ser inibidas
 */
function C_getDeveInibirTeclasControle(ctrl, event) {
    if ((jQuery.browser.msie && event.type == "keydown") ||
                (!jQuery.browser.msie && event.type == "keypress")) {
        //pega a tecla que foi digitada
        var tecla = C_TeclaDigitada(event);
        var teclaControle = C_TeclaControleDigitada(event);
        //Se o campo n�o est� em branco ou todo selecionado...
        if (ctrl.value != "" || !C_isCampoTodoSelecionado(ctrl)) {
            //N�o deixa digitar o CRTL+V, CTRL+X, SHIFT+INS
            if ( C_isTeclasControle(ctrl, event) ) {
                return true;
            }
            //Controla a digita��o do DEL e BKSP
            if (teclaControle == 8 || teclaControle == 46)  {
                pos = C_getPosTextoDigitado(ctrl);
                lenVal = String(ctrl.value).length;
                if ((teclaControle == 8 && pos != lenVal) ||
                        (teclaControle == 46 && pos != lenVal-1)) {
                     return true;
                }
            }
        }
    }
    return false;
}

/**
 * Retira os caracteres especiais de um CPF/CNPJ
 */
function C_EliminaMascaraCPFCNPJ(nuIdent) {
	var nuTemp = String(nuIdent);
    nuTemp = nuTemp.replace(/\\/g, "");
    nuTemp = nuTemp.replace(/\//g, "");
    nuTemp = nuTemp.replace(/,/g, "");
    nuTemp = nuTemp.replace(/\./g, "");
    nuTemp = nuTemp.replace(/-/g, "");
    nuTemp = nuTemp.replace(/\s/g, "");
    return nuTemp;
}

/**
 * Verifica se o formato do campo � valido
 */
function C_verificaValor(ctrl) {
	var ctrlFormatType = ctrl.getAttribute('formatType');
    if (ctrlFormatType != null) {
        var formatType = new String(ctrlFormatType).toUpperCase();
        if (formatType == "TEXT") {
            return CT_verificaValor(ctrl);
        } else if (formatType == "NUMBER") {
            return CN_verificaValor(ctrl);
        } else if (formatType == "DATE") {
            return CD_verificaValor(ctrl);
        } else if (formatType == "MASK") {
            return CM_verificaValor(ctrl);
        } else if (formatType == "CPF") {
            return CCPF_verificaValor(ctrl);
        } else if (formatType == "CNPJ") {
            return CCNPJ_verificaValor(ctrl);
        } else if (formatType == "EMAIL") {
            return CEMAIL_verificaValor(ctrl);
        } else if(formatType == "FORMATEDDATE"){
        	return CFD_verificaValor(ctrl);
        } else if(formatType == "TELEFONE"){
        	var idCampoTelefone = ctrl.getAttribute('idCampoTelefone');
        	var campoTelefone = new CampoTelefone(idCampoTelefone);
        	return campoTelefone.verificaSeRespeitaMascara();
        }
    }
    return true;
}

/*
 * Verifica se o campo est� preenchido
 */
function C_verificaObrigatorio(ctrl) {
    if (ctrl.value == null || jQuery.trim(ctrl.value) == "") {
        var rotulo = ctrl.getAttribute('rotulo');
        if (rotulo != "" && rotulo != "null" && rotulo != null) {
            C_mostreMsgCampoObrigatorio(rotulo, {
            	campoValidado: ctrl
            });
        } else {
            alert(msgKey("label.js.compoObrigatorio",""));
        }
        if((ctrl.offsetHeight != 0 || C_exibeDivSubtitleCampo(ctrl)) && !$(ctrl).is(':visible')){
	    	//adicionado para resolver erro de campos com display none
	    	try{
	    		ctrl.focus();
	    	}catch(e){
	    		return false;
	    	}
	    }
        return false;
    }
    return true;
}

function campoObrigatorio(ctrl) {

}

function C_exibeDivSubtitleCampo(campo){
    var div = campo;
    while(div != null && div.nodeName != 'DIV' && jQuery(div).attr("subtitleDiv") != "true"){
        div = div.parentNode;
    }
    if(div != null) {
        IH_toogleDiv(div);
        return true;
    }
    return false;
}

/*
 * Mostra a mensagem de campo obrigatorio
 */
function C_mostreMsgCampoObrigatorio(rotulo, options) {
    alert(msgKey("label.js.campoDevePreenchido", rotulo), options);
}

/*
 * Mostra a mensagem de campo com valor duplicado
 */
function C_mostreMsgValorCampoDuplicado(rotulo) {
   alert(msgKey("label.js.valoresDuplicados",rotulo));
}

function C_mostraHint(event, msg) {
    var objBody = document.getElementsByTagName("BODY")[0];
    var objDiv = document.createElement("DIV");
    objDiv.id = "hint";
    objDiv.className = "hint";
    objDiv.style.visibility = "visible";
    objDiv.style.position = 'absolute';
    objDiv.style.left = (event.clientX + document.body.scrollLeft + 10)
+ "px";
    objDiv.style.top = event.clientY + document.body.scrollTop + "px";
    objBody.appendChild(objDiv);
    var objText = document.createTextNode(msg);
    objDiv.appendChild(objText);
}

function C_escondeHint() {
    var objLayer = document.getElementById("hint");
    if(objLayer != null)
        objLayer.parentNode.removeChild(objLayer);
}

function C_moveHint(event) {
    var objHint = document.getElementById("hint");
    if(objHint != null){
        objHint.style.left = (event.clientX + document.body.scrollLeft +
10) + "px";
        objHint.style.top = event.clientY + document.body.scrollTop + "px";
    }
}

function C_OFC(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
		ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
	}
}
/**
 * Retorna TRUE se o CNPJ for v�lido .
 */
function CCNPJ_isCNPJValido(strCNPJ) {
    var strCNPJ = C_EliminaMascaraCPFCNPJ(strCNPJ);
    if (strCNPJ == "") {
        return true;
    } else if (String(strCNPJ).length != 14) {
        return false;
    }
    var cnpj = strCNPJ;
    var strDV = strCNPJ.substr(12, 2);
    var intDigito = 0;
    var strControle = "";
    var strMultiplicador = "543298765432";
    var strCNPJ = strCNPJ.substr(0, 12);
    var intSoma=null;

    for (var j=1; j<=2; j++) {
        var intSoma = 0;
        for (var i=0; i<=11; i++) {
            intSoma += (parseInt(strCNPJ.substr(i, 1), 10) * parseInt(strMultiplicador.substr(i, 1), 10));
        }
        if (j == 2) {
            intSoma += (2 * intDigito);
        }
        intDigito = (intSoma * 10) % 11;
        if (intDigito == 10) {
            intDigito = 0;
        }
        strControle += intDigito.toString();
        strMultiplicador = "654329876543";
    }

    if (strControle != strDV) {
        return false;
    }
	//utilizando o cnpj(valor - 99999999999962) ao invez de strCNPJ(valor - 999999999999),
    //pois estava gerando erros em cnpj como 99.999.999/9999-62
    var charOld = cnpj.charAt(0);
    var todosNumsIguais = false;
    var tamanhoCnpj = String(cnpj).length;

    for (var i=1;i<tamanhoCnpj;i++) {
        var todosNumsIguais = (charOld == cnpj.charAt(i));
        if (!todosNumsIguais) {
            return true;
        } else {
            charOld = cnpj.charAt(i);
        }
    }
    return false;
}

/**
 * Verifica se o valor do campo � v�lido
 */
function CCNPJ_verificaValor(ctrl) {
    //Se n�o for v�lido, limpa o campo e mostra uma mensagem
    if (!CCNPJ_isCNPJValido(ctrl.value)) {
        //alert (msgKey("label.js.cnpjInvalido",ctrl.value));
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}

/**
 * Tratamento de digita��o no componente.
 */
function CCNPJ_KPS(ctrl, event) {
    ctrl.setAttribute("formato","00.000.000/0000-00");
    CM_KPS(ctrl, event);
}

/**
 * Trata a digita��o no campo.
 */
function CCNPJ_KDN(ctrl, event) {
    ctrl.setAttribute("formato","00.000.000/0000-00");
    CM_KDN(ctrl, event);
}

/** Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos **/
function CCNPJ_BLR(ctrl) {
    CCNPJ_verificaValor(ctrl);
}

function CCNPJ_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.cnpjInvalido',ctrl.value));
	}
}

function CCNPJ_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CCNPJ_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}
/**
 * Retorna TRUE se o VPF for v�lido
 */
function CCPF_isCPFValido(cpf) {
    var cpf = C_EliminaMascaraCPFCNPJ(cpf);
    if (cpf == "") {
        return true;
    } else if (String(cpf).length != 11) {
        return false;
    }
    var rcpf1 = cpf.substr(0,9);
    var rcpf2 = cpf.substr(9,2);
    var d1 = 0;
    for (var i=0; i<9; i++) {
        d1 += rcpf1.charAt(i)*(10-i);
    }
    d1 = 11 - (d1 % 11);
    if (d1 > 9) {
        d1 = 0;
    }
    if (rcpf2.toString().charAt(0) != d1.toString().charAt(0)) {
        return false;
    }
    d1 *= 2;
    for (i=0; i<9; i++) {
        d1 += rcpf1.charAt(i)*(11-i);
    }
    d1 = 11 - (d1 % 11);
    if (d1 > 9) {
        d1 = 0;
    }
    if (rcpf2.toString().charAt(1) != d1.toString().charAt(0)) {
        return false;
    }
    var charOld = cpf.charAt(0);
    var todosNumsIguais = false;

    var cpfTamnho = String(cpf).length;

    for (var i=1;i<cpfTamnho;i++) {
        var todosNumsIguais = (charOld == cpf.charAt(i));
        if (!todosNumsIguais) {
            return true;
        } else {
            charOld = cpf.charAt(i);
        }
    }
    return false;
}

/**
 * Verifica se o valor do campo � v�lido
 */
function CCPF_verificaValor(ctrl) {
	//remove todos os espa�os em branco
	ctrl.value = remover_espacos(ctrl.value);
    //se n�o for v�lido, limpa o campo e mostra uma mensagem
    if (!CCPF_isCPFValido(ctrl.value)) {
        //alert (msgKey("label.js.cpfInvalido",ctrl.value));
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}

/**
 * Tratamento de digita��o no componente.
 */
function CCPF_KPS(ctrl, event) {
    ctrl.setAttribute("formato","000.000.000-00");
    CM_KPS(ctrl, event);
}

/**
 * Trata a digita��o no campo.
 */
function CCPF_KDN(ctrl, event) {
    ctrl.setAttribute("formato","000.000.000-00");
    CM_KDN(ctrl, event);
}

/** Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos **/
function CCPF_BLR(ctrl) {
	CCPF_verificaValor(ctrl);
}

function CCPF_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.cpfInvalido',ctrl.value));
	}
}

function CCPF_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CCPF_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}

function remover_espacos(str){
    var r = "";
    var strTamanho = str.length;

    for(var i = 0; i < strTamanho; i++){
      if(str.charAt(i) != ' ')
        r += str.charAt(i);
   }
  return r;
}
//Criado para resolver o problema do onchange do firefox.
var oldValueSPW_CD;

/**
 * Retorna a data como um Array de 3 posi��es contendo:
 * [0] = DD, [1] = MM, [2] = AAAA
 */
function CD_getDataSplit(texto) {
    var dataSplit = texto.split("/");
    var numBarrasCompletar = 3 - dataSplit.length;
    for (nPosData=0;nPosData<numBarrasCompletar;nPosData++) {
        var texto = texto + "/";
    }
    if (numBarrasCompletar > 0) {
        dataSplit = texto.split("/");
    }
    return dataSplit;
}

/**
 * Retorna a data formatada. Caso a data esteja incompleta, retorna a data
 * de forma completa.
 */
function CD_getValorFormatado(texto) {
    if (texto == "") {
        return "";
    }
    //Inicializa os valores da vari�veis de controle
    var dia = 0;
    var mes = 0;
    var ano = 0;
    var dataAtual = new Date();
    //Pega os valores do dia, m�s e ano
    var dataSplit = CD_getDataSplit(texto);
    //Formata o dia
    dia = Number(dataSplit[0]);
    if (dia == 0) {
        dia = dataAtual.getDate();
    }
    if (String(dia).length == 1) {
        dia = "0" + dia;
    }
    //Formata o m�s
    mes = Number(dataSplit[1])
    if (mes == 0) {
        mes = dataAtual.getMonth()+1; //getMonth() - 0 a 11
    }
    if (String(mes).length == 1) {
        mes = "0" + mes;
    }
    //Formata o ano
    ano = dataSplit[2]
    if ((dataSplit[2] != "00") && (Number(ano) == 0)) {
        ano = dataAtual.getFullYear();
    } else if (String(dataSplit[2]).length <= 2) {
        if (String(ano).length == 1) {
            ano = "0" + ano;
        }
        inicioAno = String(dataAtual.getFullYear()).substr(0,2);
        ano = Number(inicioAno + ano);
        if ((ano - 50) >= dataAtual.getFullYear()) {
            ano = ano - 100;
        }
    }
    return dia + "/" + mes + "/" + ano;
}

/**
 * Retorna uma mensagem de erro caso o formato do campo n�o for v�lido.
 */
function CD_isFormatoValido(textoDigitado) {
    if (textoDigitado == "") {
        return "";
    }
    //Pega os valores do dia, m�s e ano
    var dataSplit = CD_getDataSplit(textoDigitado);
    var dia = Number(dataSplit[0]);
    var mes = Number(dataSplit[1]);
    var ano = Number(dataSplit[2]);
    //Valida a data
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
        return "A data digitada � inv�lida.";
    }
    // Verifica se � ano bissexto
    var bissexto = ((ano % 4 == 0) && (ano % 100 != 0)) || (ano % 400 == 0);
    //Verifica se o ano � v�lido
    var min_ano = 1753; //Menor ano: SQLServer=1753, DB2=0001, Oracle=-4712, Informix=0001
    //if (ano > 99 && ano < min_ano) {
    if (ano < min_ano) {
        return "O ano informado deve ser maior que " + min_ano + ".";
    }
    if (ano > 9999) {
    	return "A data digitada � inv�lida.";
    }
    if (dia < 1 || mes < 1) {
    	return "A data digitada � inv�lida.";
    }
    //verifica se o m�s � v�lido
    if (mes > 12) {
        return "O m�s n�o pode ser maior que 12.";
    }
    //verifica se o dia � valido
    if ((mes == 2) && (bissexto) && (dia > 29)) {
        return "O m�s " + mes + " n�o pode ter mais que 29 dias.";
    }
    if ((mes == 2) && (!bissexto) && (dia > 28)) {
        return "O m�s " + mes + " n�o pode ter mais que 28 dias.";
    }
    if ((dia > 31) && ((mes == 1) || (mes == 3) || (mes == 5) || (mes == 7) || (mes == 8) || (mes == 10) || (mes == 12))) {
        return "O m�s " + mes + " n�o pode ter mais que 31 dias.";
    }
    if ((dia > 30) && ((mes == 4) || (mes == 6) || (mes == 9) || (mes == 11))) {
        return "O m�s " + mes + " n�o pode ter mais que 30 dias.";
    }
    return "";
}

/**
  * verifica se o texto exitentes em "ctrl" � uma data v�lida.
  */
function CD_verificaValor(ctrl) {

    var name = '#' + ctrl.name + '_tpAgendamento';
    var $name = jQuery(name);
    if ($name[0]) {
        return true;
    }

    //formata o campo data
    var valordigitado = CD_getValorFormatado(ctrl.value);
    ctrl.value = valordigitado;
    //verifica se o texto � v�lido
    var msgformato = CD_isFormatoValido(valordigitado);
    //se n�o for v�lido, mostra uma mensagem
    if (msgformato != "") {
        //alert (msgformato + msgKey("label.js.valorDigitado","") + valordigitado + "\".");
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}
/**
 * trata a entrada de teclas de controle de modificacao de conteudo. ctrl-v, shitf-ins, ctrl-x.
 */
function CD_KDN(ctrl, event){
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
}
/**
 * Tratamento de digita��o no componente
 */
function CD_KPS(ctrl, event) {
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
	else//Nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
		if (C_NaoPodeProcessarOnKeyPress(ctrl, event)) {
			return;
		}
    //inicializa as vari�veis de controle
    tecla = C_TeclaDigitada(event);
    //aceita numeros e a barra
    if (!( (tecla >= 48 && tecla <= 57) || tecla == 47)) {
        C_CancelaEvento(event);
        return;
    }
    //pega o texto que est� sendo digitado
    textoDigitado = C_getTextoDigitado(ctrl, String.fromCharCode(tecla));
    //Pega os valores do dia, m�s e ano
    dataSplit = CD_getDataSplit(textoDigitado);
    //Verifica se n�o existe mais que duas barras
    if (dataSplit.length > 3) {
        C_CancelaEvento(event);
        return;
    }
    //completa as barras
    pos = C_getPosTextoDigitado(ctrl);
    if ( tecla != 47 && String(textoDigitado).length == pos+1 &&
         (String(dataSplit[0]).length == 3 || String(dataSplit[1]).length == 3) ) {
        ctrl.value = ctrl.value + "/";
    } else {
        //verifica o formato do dia/mes/ano
        if ( (String(dataSplit[0]).length > 2) || (String(dataSplit[1]).length > 2) || (String(dataSplit[2]).length > 4) ) {
            C_CancelaEvento(event);
            return;
        }
    }
}

/**
  * Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos
  */
function CD_BLR(ctrl) {
	var valueBeforeBLR = ctrl.value;
    //verifica se o texto existente no campo � v�lido
    CD_verificaValor(ctrl);
    //Adicionado para arrumar o bug de n�o chamar o onchange no firefox.
    if(jQuery.browser.mozilla){
    	if(oldValueSPW_CD != ctrl.value && valueBeforeBLR.length != 10){
    		//Criando o evento onchange pois fazendo s� o ctrl.onchange() o event ia nulo
			var chgEvent = document.createEvent("HTMLEvents");
			chgEvent.initEvent("change", true, true)
			ctrl.dispatchEvent(chgEvent);
    	}
    }
}

function CD_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.dataInvalida',ctrl.value));
	}
}

function CD_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CD_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}

function CD_OFC(ctrl, event){
	oldValueSPW_CD = ctrl.value;
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
		ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
	}
	ctrl.select();
}
/**
 * Retorna uma mensagem de erro caso o formato do campo n�o for v�lido.
 * Pego de "http://javascript.internet.com/forms/email-address-validation.html"
 */
function CEMAIL_isFormatoValido(textoDigitado) {
    if (textoDigitado == "") {
        return "";
    }

    var checkTLD=1;
    var emailPat=/^(.+)@(.+)$/;
    var specialChars="\\(\\)><@,;:\\\\\\\"\\.\\[\\]";
    var validChars="\[^\\s" + specialChars + "\]";
    var quotedUser="(\"[^\"]*\")";
    var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
    var atom=validChars + '+';
    var word="(" + atom + "|" + quotedUser + ")";
    var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
    var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$");
    var matchArray=textoDigitado.match(emailPat);
    if (matchArray==null) {
        return 'O formato do endere�o de e-mail n�o � v�lido. Verifique se ele tem o formato "usuario@dominio".';
    }
    var user=matchArray[1];
    var domain=matchArray[2];
    var userTamanho = user.length;
    for (var i=0; i<userTamanho; i++) {
        if (user.charCodeAt(i)>127) {
            return "O endere�o de e-mail possui caracteres inv�lidos";
        }
    }
    var domainTamanho = domain.length;
    for (var i=0; i<domainTamanho; i++) {
        if (domain.charCodeAt(i)>127) {
            return "O endere�o de e-mail possui caracteres inv�lidos";
        }
    }
    if (user.match(userPat)==null) {
        return 'O formato do usu�rio informado no endere�o de e-mail n�o � valido.';
    }
    var IPArray=domain.match(ipDomainPat);
    if (IPArray!=null) {
        for (var i=1;i<=4;i++) {
            if (IPArray[i]>255) {
                return 'O endere�o IP informado no endere�o de e-mail n�o � valido.';
            }
        }
        return "";
    }
    var atomPat=new RegExp("^" + atom + "$");
    var domArr=domain.split(".");
    var len=domArr.length;
    for (i=0;i<len;i++) {
        if (domArr[i].search(atomPat)==-1) {
            return 'O formato do dom�nio informado no endere�o de e-mail n�o � v�lido.';
        }
    }
    if (len<2) {
        return 'O dom�nio informado no endere�o de e-mail deve possuir pelo menos duas partes. Por exemplo: "usuario@empresa.com.br".';
    }
    return "";
}


/**
  * verifica se o texto exitentes em "ctrl" � um e-mail v�lido.
  */
function CEMAIL_verificaValor(ctrl) {
    var valordigitado = ctrl.value;
    //verifica se o texto � v�lido
    var msgformato = CEMAIL_isFormatoValido(valordigitado);
    //se n�o for v�lido, mostra uma mensagem
    if (msgformato != "") {
        //alert (msgformato + msgKey("label.js.valorDigitado","") + valordigitado + '\".');
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}

/**
  * Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos
  */
function CEMAIL_BLR(ctrl) {
    //verifica se o texto existente no campo � v�lido
    CEMAIL_verificaValor(ctrl);
}

function CEMAIL_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.emailInvalido',ctrl.value));
	}
}

function CEMAIL_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CEMAIL_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}
/**
 * Retorna uma mensagem de erro caso o formato do campo n�o for v�lido.
 */
function CFD_isFormatoValido(textoDigitado) {
    if (textoDigitado == "") {
        return "";
    }
    //Pega os valores do dia, m�s e ano
    dataSplit = CD_getDataSplit(textoDigitado);
    mes = Number(dataSplit[0]);
    ano = Number(dataSplit[1]);
    //Valida a data
    if (isNaN(mes) || isNaN(ano)) {
        return "A data digitada � inv�lida.";
    }

    min_ano = 1753; //Menor ano: SQLServer=1753, DB2=0001, Oracle=-4712, Informix=0001
    if (ano < min_ano) {
        return "O ano informado deve ser maior que " + min_ano + ".";
    }
    //verifica se o m�s � v�lido
    if (mes > 12) {
        return "O m�s n�o pode ser maior que 12.";
    }
    return "";
}

/**
  * verifica se o texto exitentes em "ctrl" � uma data v�lida co o formato MM/yyyy.
  */
function CFD_verificaValor(ctrl) {
    //formata o campo data
    valordigitado = CFD_getValorFormatado(ctrl.value);
    ctrl.value = valordigitado;
    //verifica se o texto � v�lido
    msgformato = CFD_isFormatoValido(valordigitado);
    //se n�o for v�lido, mostra uma mensagem
    if (msgformato != "") {
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}

/**
 * Retorna a data formatada. Caso a data esteja incompleta, retorna a data
 * de forma completa.
 */
function CFD_getValorFormatado(texto) {
    if (texto == "") {
        return "";
    }
    //Inicializa os valores da vari�veis de controle
    mes = 0;
    ano = 0;
    dataAtual = new Date();
    //Pega os valores do m�s e ano
    dataSplit = CD_getDataSplit(texto);
    //Formata o m�s
    mes = Number(dataSplit[0])
    if (mes == 0) {
        mes = dataAtual.getMonth()+1; //getMonth() - 0 a 11
    }
    if (String(mes).length == 1) {
        mes = "0" + mes;
    }
    //Formata o ano
    ano = dataSplit[1]
    if ((dataSplit[1] != "00") && (Number(ano) == 0)) {
        ano = dataAtual.getFullYear();
    } else if (String(dataSplit[1]).length <= 2) {
        if (String(ano).length == 1) {
            ano = "0" + ano;
        }
        inicioAno = String(dataAtual.getFullYear()).substr(0,2);
        ano = Number(inicioAno + ano);
        if ((ano - 50) >= dataAtual.getFullYear()) {
            ano = ano - 100;
        }
    }
    return mes + "/" + ano;
}

/**
 * Retorna a data como um Array de 2 posi��es contendo:
 * [0] = MM, [1] = AAAA
 */
function CFD_getDataSplit(texto) {
    dataSplit = texto.split("/");
    numBarrasCompletar = 2 - dataSplit.length;
    for (nPosData=0;nPosData<numBarrasCompletar;nPosData++) {
        texto = texto + "/";
    }
    if (numBarrasCompletar > 0) {
        dataSplit = texto.split("/");
    }
    return dataSplit;
}
/**
 * trata a entrada de teclas de controle de modificacao de conteudo. ctrl-v, shitf-ins, ctrl-x.
 */
function CFD_KDN(ctrl, event){
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
}
/**
 * Tratamento de digita��o no componente
 */
function CFD_KPS(ctrl, event) {
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
	else//Nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
	    if (C_NaoPodeProcessarOnKeyPress(ctrl, event)) {
	        return;
	    }
    //inicializa as vari�veis de controle
    tecla = C_TeclaDigitada(event);
    //aceita numeros e a barra
    if (!( (tecla >= 48 && tecla <= 57) || tecla == 47)) {
        C_CancelaEvento(event);
        return;
    }
    //pega o texto que est� sendo digitado
    textoDigitado = C_getTextoDigitado(ctrl, String.fromCharCode(tecla));
    //Pega os valores do dia, m�s e ano
    dataSplit = CFD_getDataSplit(textoDigitado);
    //Verifica se n�o existe mais que duas barras
    if (dataSplit.length > 2) {
        C_CancelaEvento(event);
        return;
    }
    //completa as barras
    pos = C_getPosTextoDigitado(ctrl);
    if ( tecla != 47 && String(textoDigitado).length == pos+1 &&
         (String(dataSplit[0]).length == 3)) {
        ctrl.value = ctrl.value + "/";
    } else {
        //verifica o formato do mes/ano
        if ( (String(dataSplit[0]).length > 2) || (String(dataSplit[1]).length > 4)) {
            C_CancelaEvento(event);
            return;
        }
    }
}

/**
  * Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos
  */
function CFD_BLR(ctrl) {
    //verifica se o texto existente no campo � v�lido
    CFD_verificaValor(ctrl);
}

function CFD_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.dataInvalida',ctrl.value));
	}
}

function CFD_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CFD_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}

/**
 * Retorna a data concatenada com o primeiro ou �ltimo dia do m�s desejado.
 */
function appendDay(valor, dia) {
    if (valor == "") {
        return "";
    }else{
    	var appendDay = "";
    	if(dia == "FIRST"){
    		appendDay = "01/";
    	}else{
		    //Pega os valores do dia, m�s e ano
		    dataSplit = CD_getDataSplit(valor);
		    var mes = Number(dataSplit[0]);
		    var ano = Number(dataSplit[1]);
		    // Verifica se � ano bissexto
		    var bissexto = ((ano % 4 == 0) && (ano % 100 != 0)) || (ano % 400 == 0);

		    //verifica se o dia � valido
		    if ((mes == 2) && (bissexto)) {
		        appendDay = "29/";
		    }
		    if ((mes == 2) && (!bissexto)) {
		        appendDay = "28/";
		    }
		    if ((mes == 1) || (mes == 3) || (mes == 5) || (mes == 7) || (mes == 8) || (mes == 10) || (mes == 12)) {
		        appendDay = "31/";
		    }
		    if ((mes == 4) || (mes == 6) || (mes == 9) || (mes == 11)) {
		        appendDay = "30/";
		    }
	    }
	    return (appendDay + valor);

	}
}
/*
if (this.readOnly && this.style.backgroundColor.toUpperCase() != escurecerCor(corSelecionada)) {
    this.style.backgroundColor = corDesabilitada;
}
*/
function CGRID_BLR(ctrl) {
    if (ctrl.readOnly != true) {
        mudarCorLinha(ctrl, "blur");
        //setLarguraBorda(ctrl, "0px")
    }
}

/**
 * Tratamento do evento OnFocus.
 */
function CGRID_FCS(ctrl) {
	var index = getFieldIndex(ctrl.id);
	var grid = getGrid(ctrl);
	var columnId = getColumnId(grid, "status", index);
	var inputStatus = document.getElementById(columnId);
	if (inputStatus.value === "D") {
		return;
	}
	if (ctrl.readOnly != true) {
		mudarCorLinha(ctrl, "focus");
		//setLarguraBorda(ctrl, "2px")
	}
}

function CGRID_CHG(ctrl) {
    var grid = getGrid(ctrl);
    var index = getFieldIndex(ctrl.id);
    changeActionGrid(grid, index, "U");
}

/**
 * Tratamento do evento OnKeyDown.
 */
function CGRID_KDN(ctrl, event){
    if (ctrl.nodeName == "SELECT"){
        return;
    }
    var tecla = event.keyCode;
    if (tecla == 38) {
        inc = -1
    } else if (tecla == 40) {
        inc = 1
    }
    if (tecla == 40 || tecla == 38) {
        var grid = getGrid(ctrl);
        var objTR = ctrl;
        while(objTR.tagName != 'TR' && objTR != null){
        	objTR = objTR.parentNode;
        }
        var trs = grid.getElementsByTagName('TR');
        j = 0;
        while(trs[j].getAttribute('id') != objTR.getAttribute('id')){
        	j++;
        }
        var trProximo = trs[j+inc];
        var index = new Number(getFieldIndex(trProximo.getAttribute('id')));
        if (index >= 0) {
            var nome = getFieldName(ctrl.getAttribute('id'))
            var internalColName = getInternalColName(ctrl, nome);

            index = getFieldIndex(trProximo.getAttribute('id'));
            var idProx = getColumnId(ctrl, internalColName, index);
            var objProximo = document.getElementById(idProx);
            while (objProximo != null) {
                if ((objProximo.readOnly != true) && (objProximo.getAttribute('id').lastIndexOf("_-1") != objProximo.getAttribute('id').length - 3)) {
                    objProximo.focus();
                    return;
                }
                index = index + inc;
                idProx = getColumnId(ctrl, internalColName, index);
                objProximo = document.getElementById(idProx);
            }
        }
    }
}
//Maisculo = obrigatorio, Minusculo = opcional
mMskAlpha = "L";           // A-Z,a-z
mMskAlphaOpt = "l";
mMskAlphaNum = "A";        // A-Z,a-z,0-9
mMskAlphaNumOpt  = "a";
mMskAscii = "C";           // qquer caracter
mMskAsciiOpt = "c";
mMskNumeric = "0";         // 0-9
mMskNumericOpt = "9";
mMskNumSymOpt = "#";       // + ou -

/**
 * Retorna o caracter na posi��o "pos" da m�scara se for um literal.
 */
function CM_getIfMaskLiteral(formato, pos) {
    var charDig = formato.charAt(pos);
    if (CM_isLiteralRestrict(charDig)) {
        return charDig;
    }
    return "";
}
/**
 * Retorna todos caracteres subsequentes a posi��o "pos" da m�scara se for um literal.
 */
function CM_getAllMaskLiteral(formato, pos) {
    var charDig = formato.charAt(pos);
    var fullMask = new String("");
    if (CM_isLiteralRestrict(charDig)) {
     do {
      fullMask += charDig;
      pos = pos + 1;
      charDig = formato.charAt(pos);
     } while (CM_isLiteralRestrict(charDig));

     return fullMask;
    }
    return "";
}
function CM_isLiteralRestrict(charDig){
	 return (charDig != mMskAlpha && charDig != mMskAlphaOpt &&
	            charDig != mMskAlphaNum && charDig != mMskAlphaNumOpt &&
	            charDig != mMskAscii && charDig != mMskAsciiOpt &&
	            charDig != mMskNumeric && charDig != mMskNumericOpt &&
	            charDig != mMskNumSymOpt);
}
function CM_isOptionalChar(charDig) {
	return (charDig == mMskNumericOpt || charDig == mMskNumSymOpt || charDig == mMskAsciiOpt ||
			charDig == mMskAlphaNumOpt || charDig == mMskAlphaOpt);
}

/**
 * Retorna TRUE se o caracter "charDig" digitado na posi��o "pos" for v�lido.
 */
function CM_isCaracterValido(formato, charDig, pos) {
        var textovalido = false;
        //Verifica se o tamanho do texto � v�lido
        if (String(formato).length <= pos) {
            return "O tamanho do texto digitado � maior do que o tamanho " +
                "permitido. Tamanho permitido: \"" +
                String(formato).length + "\".";
        }
        //Verifica se a m�scara � v�lida

        var mask = formato.charAt(pos);
        if(mask == mMskAsciiOpt || (mask == mMskAscii && charDig != " ")){
        	textovalido = true;
        } else if ((charDig >= "A" && charDig <= "Z") || (charDig >= "a" && charDig <= "z")) {
            textovalido = (mask == mMskAlpha || mask == mMskAlphaOpt ||
                mask == mMskAlphaNum || mask == mMskAlphaNumOpt);
        } else if (charDig >= "0" && charDig <= "9") {
            textovalido = (mask == mMskAlphaNum || mask == mMskAlphaNumOpt ||
                mask == mMskNumeric || mask == mMskNumericOpt);
        } else if (charDig == "+") {
            textovalido = (mask == mMskNumSymOpt);
        } else if (charDig == "-") {
            textovalido = (mask == mMskNumSymOpt || charDig == mask);
        } else if (charDig == " ") {
            textovalido = (mask == mMskAlphaOpt || mask == mMskAlphaNumOpt ||
                mask == mMskNumericOpt || mask == mMskNumSymOpt  || mask == " ");
        } else {
            textovalido = (mask == charDig);
        }
        //Retorna o resultado da verifica��o
        if (!textovalido) {
            return "O caracter \"" + charDig + "\" n�o � permitido " +
                "na posi��o \"" + (pos+1) + "\"";
        } else {
            return "";
        }
}

/**
 * Retorna o conte�do do campo sem a m�scara.
 */
function CM_getConteudoSemMascara(formato, textodigitado){
	var nTextoSize = String(textodigitado).length;
	var conteudo = "";
	for(var i = 0; i < nTextoSize; i++){
		if(CM_getIfMaskLiteral(formato, i) == ""){
			conteudo = conteudo + textodigitado.charAt(i);
		}
	}
	return conteudo;
}

/**
 * Aplica a m�scara num conte�do limpo, ou seja, que est� sem m�scara.
 */
function CM_aplicaMascaraAoConteudo(formato, conteudo, maskAlign){
    var nFormatoSize = String(formato).length;
    var nConteudo = 0;
    var valorFinal = "";

    // percorre o formato armazenando a quantidade de literais e de valores opcionais
    var literalCount = 0;
    for (var i = 0; i < nFormatoSize; i++) {
          var charLiteral = CM_getIfMaskLiteral(formato, i);
          if (charLiteral != "") {
                 literalCount++;
          }
    }

	var conteudoSemEspacos = conteudo.replaceAll(" ", "");

	// se h� diferen�a no tamanho do formato para o tamanho do conte�do sem espa�o mais os literais,
	// � pq algum campo opcional n�o foi preenchido
	var dif = nFormatoSize - (conteudoSemEspacos.length + literalCount);
	var count = 0;
	for (var i = 0; i < nFormatoSize; i++) {
		var charLiteral = CM_getIfMaskLiteral(formato, i);

		if (charLiteral != "") {
			valorFinal = valorFinal + charLiteral;
		} else if (CM_isOptionalChar(formato.charAt(i)) && dif > 0) {
			// vai pulando os valores opcionais at� compensar a diferen�a
			if (maskAlign == "right") {
				if (dif != count) {
					valorFinal += " ";
					count++;
				} else {
					valorFinal = valorFinal + conteudoSemEspacos.charAt(nConteudo++);
				}
			}
			else {
				if (dif != count) {
					valorFinal = valorFinal + conteudoSemEspacos.charAt(nConteudo++);
					count++;
				}
			}
		} else {
			valorFinal = valorFinal + conteudoSemEspacos.charAt(nConteudo++);
		}
	}

    return valorFinal;
}

/**
 * Aplica o comportamento da propriedade maskAlign.
 */
function CM_ajustaConteudoPeloMaskAlign(ctrl){
	var maskAlign = ctrl.getAttribute("maskAlign");
	var textodigitado = ctrl.value;
	var formato = ctrl.getAttribute("formato");
	var nFormatoSize = String(formato).length;
    var nTextoSize = String(textodigitado).length;
    var dv = ctrl.getAttribute("digitoVerificador");

	if(dv && !(nFormatoSize - 2 === nTextoSize) && (nTextoSize > 1)){
		var numeroBase = textodigitado.substring(0, textodigitado.length - 1);
		var digitoVerificador = textodigitado.charAt(textodigitado.length -1);

		ctrl.value = numeroBase + "-" + digitoVerificador;

		return;
	}

	if(String(maskAlign).toLowerCase() == "right" && textodigitado != ""){
		var espacos = "";
		for (var i = nTextoSize; i < nFormatoSize; i++){
			espacos = espacos + " ";
		}

		textodigitado = espacos + CM_getConteudoSemMascara(formato, textodigitado);

		if(nTextoSize > nFormatoSize/2){
			textodigitado = CM_aplicaMascaraAoConteudo(formato, textodigitado, maskAlign);
		}

		if(ctrl.value != textodigitado){
			ctrl.value = textodigitado;
		}
	}
}
/*
 * limpa o conteudo de acordo com o formato da m�scara.
 */
function C_limpaConteudoComFormato(formato, conteudo){
	var nConteudoSize = conteudo.length;
	var nConteudo = 0;
	var valorFinal = "";

	for(var i = 0; nConteudo < nConteudoSize; ){
		var charAux = conteudo.charAt(nConteudo);
		if(!CM_getIfMaskLiteral(formato, i)){
			if(!CM_isCaracterValido(formato, charAux, i)){
				valorFinal = valorFinal + charAux;
				i++
			}
			nConteudo++;
		}
		else
			i++;

	}
	return valorFinal;
}
/**
 * Retorna TRUE se o formato do "textodigitado" for igual ao formato
 * da m�scara. Esta fun��o n�o valida a m�scara inteira, somente a parte que o
 * usu�rio digitou. Se a m�scara exige a digita��o de caracteres ainda n�o digitados
 * esta fun��o n�o acusa o erro. Para verificar toda a m�scara deve-se usar a
 * fun��o CM_isFormatoInteiroValido(formato, textodigitado, maskAlign)
 */
function CM_isFormatoValido(formato, textodigitado) {
    var msgformato = "";
    var nPosTexto = 0;
    while (nPosTexto < String(textodigitado).length && msgformato == "") {
        msgformato = CM_isCaracterValido(formato, textodigitado.charAt(nPosTexto), nPosTexto);
        nPosTexto++;
    }
    return msgformato;
}

/**
 * Esta fun��o deve ser chamada somente pelo onBlur.
 * Ela faz a mesma valida��o CM_isFormatoValido faz e adicionalmente tamb�m
 * nos caracteres ainda n�o digitados.
 */
function CM_isFormatoInteiroValido(formato, textodigitado, maskAlign) {
    var msgformato = "";
    var nPosTexto = 0;
    var nFormatoSize = String(formato).length;
    var nTextoSize = String(textodigitado).length;
    var conteudoSemMascara = CM_getConteudoSemMascara(formato, textodigitado);
    if( (nFormatoSize > nTextoSize) && (maskAlign != null && String(maskAlign).toLowerCase() == "right" && nTextoSize > 0)){
          var espacos = "";
          for (var i = nTextoSize; i < nFormatoSize; i++){
                 espacos = espacos + " ";
          }
          if(maskAlign == null || String(maskAlign).toLowerCase() != "right"){
                 textodigitado = textodigitado + espacos;
          }else{
                 textodigitado = espacos + CM_getConteudoSemMascara(formato, textodigitado);
                 textodigitado = CM_aplicaMascaraAoConteudo(formato, textodigitado, maskAlign);
          }
    }

    var literalCount = 0;
    var optionalCount = 0;
    for (var i = 0; i < nFormatoSize; i++) {
          var charLiteral = CM_getIfMaskLiteral(formato, i);
          if (charLiteral != "") {
                 literalCount++;
          }
          if (CM_isOptionalChar(formato.charAt(i))) {
        	  optionalCount++;
          }
    }

    if (conteudoSemMascara.length + literalCount < formato.length - optionalCount) {
    	msgformato = "O tamanho do texto digitado � menor do que o tamanho exigido.";
    } else {
    	if (maskAlign == "right") {
    		while (nPosTexto < nFormatoSize && msgformato == "") {
    			msgformato = CM_isCaracterValido(formato, textodigitado.charAt(nPosTexto), nPosTexto);
    			nPosTexto++;
    		}
    	} else {
    		while (nPosTexto < String(textodigitado).length && msgformato == "") {
    			msgformato = CM_isCaracterValido(formato, textodigitado.charAt(nPosTexto), nPosTexto);
    			nPosTexto++;
    		}
    	}
    }
    return msgformato;
}

/**
 * Verifica se valor digitado no campo "ctrl" � v�lido.
 */
function CM_verificaValor(ctrl) {
	 var dv = ctrl.getAttribute("digitoVerificador");
	//Trocar para valor da propriedade aceita valor reduzido
	if(dv){
		 if(CM_isFormatoValido(ctrl.getAttribute("formato"), ctrl.value) || ctrl.value.length > 1){
		 	return true;
		 }
	}
	var formato = ctrl.getAttribute("formato");
    //verifica se o texto � v�lido
    var msgformato = CM_isFormatoInteiroValido(ctrl.getAttribute("formato"), ctrl.value, ctrl.getAttribute("maskAlign"));
    var valordigitado = ctrl.value;
    var qtdMinCarcteres =  ctrl.getAttribute("minLength");

    var textoSemMascara = CM_getConteudoSemMascara(formato, valordigitado);


    if(formato !== null && formato != ""){
   		 if(ctrl.value != "" && textoSemMascara.length < qtdMinCarcteres){
        	ctrl.className=ctrl.className+' erro';
      	    return false;
     	 }
    }

    //se n�o for v�lido, limpa o campo e mostra uma mensagem
    if (msgformato != "") {
        //alert (msgformato + msgKey("label.js.valorDigitado","") + valordigitado + "\".");
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    }
    if(ctrl.className.indexOf('erro')!=-1){
      	ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    }
    return true;
}

/**
 * Tratamento de digita��o no componente.
 */
function CM_KPS(ctrl, event) {
	//Verifica as teclas de controle
    if (C_getDeveInibirTeclasControle(ctrl, event)) {
        C_CancelaEvento(event);
        return;
    }
    if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}else//nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
    	if (C_NaoPodeProcessarOnKeyPress(ctrl, event)) {
    		return;
    	}
    //pega a tecla que foi digitada
    tecla = C_TeclaDigitada(event);
    //pega posi��o do texto digitado.
    pos = C_getPosTextoDigitado(ctrl);
    //pega os dados do texto que est� sendo digitado
    charDigitado = String.fromCharCode(tecla);
    textoDigitado = C_getTextoDigitado(ctrl, charDigitado);
    formato = ctrl.getAttribute("formato");
    //So permite a digitacao caso esteja no fim do campo
    if (pos < String(formato).length && pos == (String(textoDigitado).length-1)) {
        //Verifica se o formato � v�lido
        var msgformato = CM_isFormatoValido(formato, textoDigitado);
        if (msgformato != "") {
            //Verifica se deve completar a m�scara
            var charMask = CM_getAllMaskLiteral(formato, pos);
            if (charMask != "" && C_getSelLength(ctrl) == 0) {
                textoDigitado = ctrl.value + charMask + charDigitado;
                if (CM_isFormatoValido(formato, textoDigitado) == "") {
                    if (jQuery.browser.msie) {
                        range = ctrl.createTextRange();
                        range.move('character', pos);
                        range.text = charMask;
                    } else {
                        ctrl.value = ctrl.value + charMask;
                        //S� permite o onchange se o usu�rio clicou na tecla "TAB"
                        if (ctrl.onchange != null && tecla == 9) {
                            ctrl.onchange(ctrl);
                        }
                    }
                } else {
                  C_CancelaEvento(event);
                  return;
                }
            } else {
                C_CancelaEvento(event);
                return;
            }
        }
    } else {
        //Se n�o tiver uma faixa de sele��o ou a posi��o do cursor esteja
        //antes do final da mascara, sobrescreve os caracteres
        if (C_getSelLength(ctrl) > 1 || pos > String(formato).length-1) {
            C_CancelaEvento(event);
            return;
        } else {
            textoDigitado = ctrl.value.substr(0, pos) + charDigitado +
                ctrl.value.substr(pos+1);
            if (CM_isFormatoValido(formato, textoDigitado) == "") {
                if (jQuery.browser.msie) {
                    range = ctrl.createTextRange();
                    range.move('character', pos);
                    range.moveEnd('character', 1);
                    range.select();
                } else {
                    ctrl.selectionEnd = pos+1;
                }
            } else {
                C_CancelaEvento(event);
                return;
            }
        }
    }
}

/**
 * Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos
 */
function CM_BLR(ctrl) {
	//Verifica se o formato do campo � v�lido
	CM_ajustaConteudoPeloMaskAlign(ctrl);
	CM_verificaValor(ctrl);
}

/**
 * Trata a digita��o no campo.
 */
function CM_KDN(ctrl, event) {
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
    if (C_getDeveInibirTeclasControle(ctrl, event)) {
        C_CancelaEvento(event);
        return;
    }
}

/**
 * Passa o foco para o pr�ximo campo.
 */
function CM_KUP(ctrl, event) {
    focoProxCampo = ctrl.getAttribute("focoProxCampo");
    //Pula para o pr�ximo controle
    if (focoProxCampo != null) {
        formato = ctrl.getAttribute("formato");
        pos = C_getPosTextoDigitado(ctrl);
        if (formato.length == ctrl.value.length &&
           pos == ctrl.value.length) {
            ctrlFoco = FF_GetProxCtrl(ctrl);
            if (ctrlFoco != null) {
                ctrlFoco.focus();
            }
        }
    }
}

function CM_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.valorInvalido',ctrl.value));
	}
}

function CM_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CM_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}
var oldValueSPW_CN;
/**
 * Retorna o n�mero de casas v�lidas antes da v�rgula.
 */
function CN_getFormatoInt(formato) {
    var formatoInt = formato.replace("," , ".").replace("$","");
    var nPosPonto = formatoInt.indexOf(".");
    if (nPosPonto < 0) {
        return Math.abs(new Number(formatoInt));
    } else {
        return Math.abs(new Number(formatoInt.substr(0, nPosPonto)));
    }
}

/**
 * Retorna o n�mero de casas v�lidas depois da v�rgula.
 */
function CN_getFormatoDec(formato) {
    var formatoDec = formato.replace("," , ".");
    var nPosPonto = formatoDec.indexOf(".");
    if (nPosPonto < 0) {
        return 0;
    } else {
        return Math.abs(new Number(formatoDec.substr(nPosPonto+1)));
    }
}

/**
 * Retorna o valor m�ximo que pode ser digitado.
 */
function CN_getValorMaximoPermitido(max) {
    max = new Number(max);
    if (isNaN(max)) {
        max = 0;
    }
    return max;
}

/**
 * Retorna uma flag que indica se pode aceitar valores negativos.
 */
function CN_getPermiteNegativo(formato) {
    return (formato.indexOf("-") == 0);
}

/**
 * Retorna uma flag que indica se o formato � de moeda.
 */
function CN_getFormatarComoMoeda(formato) {
    var posDolar = formato.indexOf("$");
    return (posDolar == 0 || posDolar == 1);
}

/**
 * Retorna o texto do campo sem formato.
 */
function CN_getValorDesformatado(texto) {
    return texto.replace(/\./g,"");
}

function CN_getValorDesformatadoDouble(texto) {
	return texto.replace(/\./g,"").replace(',', '.');
}

/**
 * Retorna o texto do campo formatado.
 */
function CN_getValorFormatado(formato, texto) {
    //Pega o texto sem formata��o
    texto = CN_getValorDesformatado(texto);
    if (texto == "" || texto == ",") {
        return "";
    }
    //Pega o formato do campo
    var nuDec = CN_getFormatoDec(formato);
    //Formata como moeda
    if (CN_getFormatarComoMoeda(formato)) {
        if (texto.indexOf(",") >= 0) {
            var posVirg = texto.indexOf(",");
            var nuAntesVirg = texto.substr(0, posVirg);
            var nuTamTextoAntesVirg = String(nuAntesVirg).length;
            var nuDepoisVirg = texto.substr(posVirg);
        } else {
            var nuAntesVirg = texto;
            var nuTamTextoAntesVirg = String(nuAntesVirg).length;
            var nuDepoisVirg = "";
        }
        var textoComPonto = "";
        for (nPosTextoPonto=nuTamTextoAntesVirg-1; nPosTextoPonto >=0 ; nPosTextoPonto--) {
            textoComPonto = nuAntesVirg.charAt(nPosTextoPonto) + textoComPonto;
            posPonto = nuTamTextoAntesVirg-nPosTextoPonto;
            if ((posPonto < nuTamTextoAntesVirg) && (posPonto % 3 == 0)) {
                textoComPonto = "." + textoComPonto;
            }
        }
        textoComPonto = textoComPonto.replace("-.","-");
        texto = textoComPonto + nuDepoisVirg;
    }
    //Completa as virgulas
    if (nuDec > 0) {
        posVirg = texto.indexOf(",");
        if (posVirg < 0) {
            texto = texto + ",";
            nuCasasComp = nuDec;
        } else {
            nuCasasComp = nuDec - String(texto.substr(posVirg+1)).length;
        }
        for (nCasa=0;nCasa < nuCasasComp;nCasa++) {
            texto = texto + "0";
        }
    }

    //retira os espa�os em branco do inicio e final do numero
    texto = jQuery.trim(texto);

    return texto;
}

/**
 * Retorna uma mensagem de erro caso o formato do campo n�o for v�lido.
 */
function CN_isFormatoValido(formato, max, allowZero, textoDigitado) {
	//retira os espa�os em branco do inicio e final do numero
	textoDigitado = jQuery.trim(textoDigitado);

    //Pega o texto sem formata��o
    textoDigitado = CN_getValorDesformatado(textoDigitado);
    if (textoDigitado == "") {
        return "";
    }
    //tira o sinal de negativo para verificar os tamanhos
    if (textoDigitado.indexOf("-") == 0) {
        textoDigitado = textoDigitado.substr(1);
    }
    // se for s� v�rgula considera como n�mero v�lido
    if(textoDigitado == ","){
        textoDigitado = "0" + textoDigitado;
    }

    //Verifica se � um n�mero v�lido
    var valor = Number(textoDigitado.replace(",","."));
    if (isNaN(valor)) {
        return "O valor digitado n�o � um n�mero v�lido.";
    }
    //Pega o formato do campo
    var nuInt = CN_getFormatoInt(formato);
    var nuDec = CN_getFormatoDec(formato);

    //pega a posi��o da virgura e o tamanho do texto
    var posVirg = textoDigitado.indexOf(",") + 1;
    var tamTexto = String(textoDigitado).length;
    if ((nuDec == 0) && (posVirg > 0)) {
        return "O n�mero n�o pode conter casas decimais";
    }
    //valida as casas decimais
    if ((nuDec > 0) && (posVirg > 0) && ((tamTexto - posVirg) > nuDec)) {
        return "O n�mero de casas decimais � invalido. O n�mero pode conter apenas " + nuDec +
          " casas decimais.";
    }
    //valida a parte inteira
    if ((nuInt > 0) && ( ((posVirg <= 0) && (tamTexto >  nuInt)) || ((posVirg > 0) && (posVirg-1 > nuInt)) )) {
        return "O n�mero de digitos inteiros � inv�lido. O n�mero pode conter apenas " + nuInt +
          " digitos inteiros.";
    }
    //Pega o valor m�ximo
    var valorMaximoPermitido = CN_getValorMaximoPermitido(max);
    //Verifica se o valor do campo n�o � maior que o m�ximo permitido
    if ((valorMaximoPermitido > 0) && (valor > valorMaximoPermitido)) {
        return "O n?mero digitado n?o pode ser maior que \"" + valorMaximoPermitido + "\".";
    }
    //Verifica se pode valor = 0
    if (allowZero != null && allowZero.toUpperCase() == "False".toUpperCase() && valor == 0) {
        return "O n?mero digitado deve ser diferente de zero.";
    }
    return "";
}

function CN_verificaValor(ctrl) {
    //verifica se o texto ? v?lido
    var formato = ctrl.getAttribute("formato");
    var max = ctrl.getAttribute("max");
    var allowZero = ctrl.getAttribute("allowZero");
    var msgformato = CN_isFormatoValido(formato, max, allowZero, ctrl.value);
    var valordigitado = CN_getValorDesformatado(ctrl.value);
    //se n?o for v?lido, limpa o campo e mostra uma mensagem
    if (msgformato != "") {
        //alert (msgformato + msgKey("label.js.valorDigitado", "") + valordigitado + "\".");
        //ctrl.focus();
        if(ctrl.className.indexOf('erro')==-1){
        	ctrl.className=ctrl.className+' erro';
        }
        return false;
    } else {
    //Sen?o, formata o campo
        ctrl.value = CN_getValorFormatado(formato, ctrl.value);
        if(ctrl.className.indexOf('erro')!=-1){
      		ctrl.className=ctrl.className.substring(0,ctrl.className.indexOf('erro'));
    	}
    }
    return true;
}
/**
 * trata a entrada de teclas de controle de modificacao de conteudo. ctrl-v, shitf-ins, ctrl-x.
 */
function CN_KDN(ctrl, event){
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
}

/** Tratamento de digita??o no componente **/
function CN_KPS(ctrl, event) {
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
	else//Nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
	    if (C_NaoPodeProcessarOnKeyPress(ctrl, event)) {
	        return;
	    }
    //inicializa as vari?veis de controle
    var tecla = C_TeclaDigitada(event);
    var formato = ctrl.getAttribute("formato");
    var permiteNegativo = CN_getPermiteNegativo(formato);
    var max = ctrl.getAttribute("max");
    //aceita numeros e virgula
    if (!((tecla >= 48 && tecla <= 57) || tecla == 44 || tecla == 45)) {
        C_CancelaEvento(event);
        return;
    }
    var virgulaInSel = false;
    if (document.selection) {
        var range = document.selection.createRange();
        var virgulaInSel = range.text.indexOf(",") >= 0;
    } else {
        if(ctrl.selectionEnd > ctrl.selectionStart){
		    var pos = ctrl.selectionStart;
		    var len = ctrl.selectionEnd - ctrl.selectionStart;
		    var sel = new String(ctrl.value).substr(pos, len);
		    virgulaInSel = sel.indexOf(",") >= 0;
		}
	}


    //se permitido, deixa teclar somente uma virgula
    if ((tecla == 44) && (ctrl.value.indexOf(",") >= 0) && !virgulaInSel) {
        C_CancelaEvento(event);
        return;
    }
    //se permitido, deixa teclar somente um sinal de negativo
    if ( (tecla == 45) && ((ctrl.value.indexOf("-") >= 0) || !(permiteNegativo)) ) {
        C_CancelaEvento(event);
        return;
    }
    //pega o texto que est� sendo digitado
    textoDigitado = C_getTextoDigitado(ctrl, String.fromCharCode(tecla));
    //sinal de negativo s� no come�o
    if ((tecla == 45) && (textoDigitado.indexOf("-") > 0)) {
        C_CancelaEvento(event);
        return;
    }
    //Passa "true" para o allowZero para que seja poss�vel digitar "0.XXX"
    msgformato = CN_isFormatoValido(formato, max, "true", textoDigitado);
    if (msgformato != "") {
        C_CancelaEvento(event);
        return;
    }
}

/** Trata a sa�da do campo para n�o permitir que o campo fique com valores inv?lidos **/
function CN_BLR(ctrl) {
	if(ctrl.selectionEnd != ctrl.selectionStart){
		ctrl.selectionStart = ctrl.selectionEnd;
	}
    //verifica se o texto existente no campo � v�lido
    CN_verificaValor(ctrl);
}

function CN_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.valorInvalido',ctrl.value));
	}
}

function CN_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CN_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}

function CN_OFC(ctrl, event){
	C_OFC(ctrl, event);
	ctrl.select();
	oldValueSPW_CN = ctrl.value;
}
function CampoTelefone(id) {

  	this.id = null;

  	this.campoNuTelefone = null;
  	this.campoNuDDD = null;

  	this.checkBoxMascara = null;

  	this.formato = null;
  	this.formatoOriginal = null;
  	this.minLength = null;
  	this.maxlengthWithoutMask = null;
  	this.maxlengthOriginal = null;

  	this.setId(id);

	this.registerEvents(this);
}

CampoTelefone.prototype.registerEvents = function (campoTelefone) {
	if(jQuery.browser.msie) {
		this.checkBoxMascara.bind('click', function() {campoTelefone.oncheck()});
	} else {
		this.checkBoxMascara.bind('change', function() {campoTelefone.oncheck()});
	}

	this.campoNuTelefone.bind('keypress', function(event) {return campoTelefone.campoNuTelefoneOnkeypress(event)});
	this.campoNuTelefone.bind('blur', function(event) {return campoTelefone.campoNuTelefoneOnblur(event)});
	this.campoNuTelefone.bind('mouseover', function(event) {return campoTelefone.campoNuTelefoneOnmouseover(event)});
	this.campoNuTelefone.bind('mouseout', function(event) {return campoTelefone.campoNuTelefoneOnmouseout(event)});
	this.campoNuTelefone.bind('mousemove', function(event) {return campoTelefone.campoNuTelefoneOnmousemove(event)});
	this.campoNuTelefone.bind('focus', function(event) {return campoTelefone.campoNuTelefoneOnfocus(event)});

	this.campoNuDDD.bind('focus', function(event) {return campoTelefone.campoNuDDDOnfocus(event)});
}

CampoTelefone.prototype.setId = function (id) {
	this.id = id;
	this.campoNuTelefone = jQuery('#'+this.id+'_nuTelefone');
	this.campoNuDDD = jQuery('#'+this.id+'_nuDDD');
	this.checkBoxMascara = jQuery('#'+this.id+'checkDesabilitarMascara');

	this.formato = this.campoNuTelefone.attr("formato");
	this.minLength = this.campoNuTelefone.attr("minLength");
	this.maxlengthWithoutMask = this.campoNuTelefone.attr("maxlengthWithoutMask");
	this.maxlengthOriginal = this.campoNuTelefone.attr("maxlength");

	this.formatoOriginal = this.formato;
}

CampoTelefone.prototype.campoNuDDDOnfocus = function(event) {
	this.campoNuDDD[0].select();
}

/**
*	Evento de marcar ou desmarcar o checkbox
**/
CampoTelefone.prototype.oncheck = function () {
	this.campoNuDDD[0].disabled = this.checkBoxMascara[0].checked;
	if(this.isMascaraHabilitada()) {
		this.formato = this.formatoOriginal;
		this.campoNuTelefone.attr("maxlength",this.maxlengthOriginal);
		this.campoNuDDD.removeClass('campoDddDesabilitado');
		this.campoNuTelefoneOnblur();
	} else {
		this.formato = null;
		this.campoNuTelefone.attr("maxlength",this.maxlengthWithoutMask);
		this.campoNuTelefone.removeClass("erro");
		this.campoNuDDD.addClass('campoDddDesabilitado');
	}
}

/**
 * Tratamento de digita��o no componente.
 */
CampoTelefone.prototype.campoNuTelefoneOnkeypress = function(event) {
	if(this.isMascaraHabilitada()) {
		var campoNuTelefone = this.campoNuTelefone[0];
		event = event.originalEvent;

	    //Nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
	    if (C_NaoPodeProcessarOnKeyPress(campoNuTelefone, event)) {
	        return;
	    }
	    //pega a tecla que foi digitada
	    var tecla = C_TeclaDigitada(event);
	    //pega os dados do texto que est� sendo digitado
	    var pos = C_getPosTextoDigitado(campoNuTelefone);
	    var charDigitado = String.fromCharCode(tecla);
	    var textoDigitado = C_getTextoDigitado(campoNuTelefone, charDigitado);

	    var msgformato = CM_isFormatoValido(this.formato, textoDigitado);
	    if (msgformato != "") {
	        //Verifica se deve completar a m�scara
	        var charMask = CM_getIfMaskLiteral(this.formato, pos);
	        if (charMask != "" && C_getSelLength(campoNuTelefone) == 0) {
	            textoDigitado = campoNuTelefone.value + charMask + charDigitado;
	            if (CM_isFormatoValido(this.formato, textoDigitado) == "") {
	                if (jQuery.browser.msie) {
	                    range = campoNuTelefone.createTextRange();
	                    range.move('character', pos);
	                    range.text = charMask;
	                } else {
	                    campoNuTelefone.value = campoNuTelefone.value + charMask;
	                    //S� permite o onchange se o usu�rio clicou na tecla "TAB"
	                    if (campoNuTelefone.onchange != null && tecla == 9) {
	                        campoNuTelefone.onchange(campoNuTelefone);
	                    }
	                }
	            } else {
	              return;
	            }
	        } else {
	            return;
	        }
	    }
	}
}

/**
 * Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos
 */
CampoTelefone.prototype.campoNuTelefoneOnblur = function () {
	//Verifica se o formato do campo � v�lido
	if(this.isMascaraHabilitada() && this.campoNuTelefone.val() != '') {
		this.ajustaConteudoPeloMaskAlign();
		this.verificaSeRespeitaMascara();
	}
}

CampoTelefone.prototype.campoNuTelefoneOnmouseover = function (event){
	if(this.campoNuTelefone.hasClass('erro')){
		C_mostraHint(event, msgKey('label.js.valorInvalido',this.campoNuTelefone.val()));
	}
}

CampoTelefone.prototype.campoNuTelefoneOnmousemove = function (event){
	if(this.campoNuTelefone.hasClass('erro')){
		C_moveHint(event);
	}
}

CampoTelefone.prototype.campoNuTelefoneOnmouseout = function (event){
	if(this.campoNuTelefone.hasClass('erro')){
		C_escondeHint();
	}
}

CampoTelefone.prototype.campoNuTelefoneOnfocus = function (event){
	if(this.campoNuTelefone.hasClass('erro')){
		this.campoNuTelefone.removeClass('erro');
		C_escondeHint();
	}
	this.campoNuTelefone[0].select();
}

/**
 * Aplica o comportamento da propriedade maskAlign.
 */
CampoTelefone.prototype.ajustaConteudoPeloMaskAlign = function (){
	var campoNuTelefone = this.campoNuTelefone[0];

	var textodigitado = campoNuTelefone.value;
	var nFormatoSize = String(this.formato).length;
    var nTextoSize = String(textodigitado).length;

	if(textodigitado != ""){
		var espacos = "";

		var caracteresFaltantes = this.getQtdeCaracteresSeparadoresDoFormato() - this.getQtdeCaracteresSeparadoresNoTexto(textodigitado);
		if(caracteresFaltantes < 0) caracteresFaltantes = 0;

		for (var i = nTextoSize; i < nFormatoSize - caracteresFaltantes; i++){
			espacos = espacos + " ";
		}

		textodigitado = espacos + this.getConteudoSemMascara(this.formato, textodigitado);

		if(nTextoSize > nFormatoSize/2){
			textodigitado = this.aplicaMascara(this.formato, textodigitado);
		}

		if(campoNuTelefone.value != textodigitado){
			campoNuTelefone.value = textodigitado.trim();
		}
	}
}

/**
 * Retorna o conte�do do campo sem a m�scara.
 */
CampoTelefone.prototype.getConteudoSemMascara = function (formato, textodigitado){
	var nTextoSize = String(textodigitado).length;
	for(var i = 0; i < nTextoSize; i++){
		var charMask = CM_getIfMaskLiteral(formato, i);
		if(charMask != ""){
			textodigitado = replaceAll(textodigitado, charMask, "");
		}
	}
	return textodigitado;
}

/**
 * Verifica se valor digitado no campo "ctrl" � v�lido.
 */
CampoTelefone.prototype.verificaSeRespeitaMascara = function (){
	if(this.isMascaraHabilitada() && this.campoNuTelefone.val() != '') {
		var campoNuTelefone = this.campoNuTelefone[0];

	    //verifica se o texto � v�lido
	    var msgformato = this.verificaSeRespeitaFormato(this.formato, campoNuTelefone.value, "right");
	    var valordigitado = campoNuTelefone.value;
	    var qtdMinCarcteres =  this.minLength;

	    var textoSemMascara = this.getConteudoSemMascara(this.formato, valordigitado);


	    if(this.formato !== null && this.formato != ""){
	   		 if(campoNuTelefone.value != "" && textoSemMascara.length < qtdMinCarcteres){
	        	this.campoNuTelefone.addClass('erro');
	      	    return false;
	     	 }
	    }

	    if (msgformato != "") {
	        if(!this.campoNuTelefone.hasClass('erro')){
	        	this.campoNuTelefone.addClass('erro');
	        }
	        return false;
	    }
	    if(this.campoNuTelefone.hasClass('erro')){
			this.campoNuTelefone.removeClass('erro');
		}
	}
    return true;
}


CampoTelefone.prototype.verificaSeRespeitaFormato = function (formato, textodigitado){
	var msgformato = "";
	var nPosTexto = 0;
	var nFormatoSize = String(formato).length;
	var nTextoSize = String(textodigitado).length;

	if(nFormatoSize > nTextoSize) {
		var espacos = "";
		for (var i = nTextoSize; i < nFormatoSize; i++){
			espacos = espacos + " ";
		}
		textodigitado = espacos + textodigitado;
	}

    while (nPosTexto < String(textodigitado).length && msgformato == "") {
		msgformato = CM_isCaracterValido(formato, textodigitado.charAt(nPosTexto), nPosTexto);
		nPosTexto++;
	}
	return msgformato;
}

/**
 * Aplica a m�scara num conte�do limpo, ou seja, que est� sem m�scara.
 */
CampoTelefone.prototype.aplicaMascara = function (formato, textodigitado){
	var nFormatoSize = String(formato).length;
	var nConteudoSize = String(textodigitado).length;
	var nConteudo = 0;
	var valorFinal = "";



	for(var i = 0; i < nFormatoSize && nConteudo <= nConteudoSize && valorFinal.length < nFormatoSize; i++){
		var charLiteral = CM_getIfMaskLiteral(this.formato, i);
		if(charLiteral == ""){
			valorFinal = valorFinal + textodigitado.charAt(nConteudo++);
		}else{
			valorFinal = valorFinal + charLiteral + textodigitado.charAt(nConteudo++);
		}
	}
	return valorFinal;
}

CampoTelefone.prototype.getQtdeCaracteresSeparadoresDoFormato = function() {
	return this.getCaracteresSeparadoresDoFormato().length;
}

CampoTelefone.prototype.getQtdeCaracteresSeparadoresNoTexto = function(textoDigitado) {
	var caracteres = this.getCaracteresSeparadoresDoFormato();
	var count = 0;
	for(var i = 0; i < textoDigitado.length; i++) {
		var charAt = textoDigitado.charAt(i);
		var caracteresLength = caracteres.length;
		for (var j = 0; j < caracteresLength; j++) {
			if (charAt === caracteres[j]) {
				count++;
			}
		}
	}
	return count;
}
CampoTelefone.prototype.getCaracteresSeparadoresDoFormato = function() {
	var formatoLength = this.formato.length;
	var caracteres = new Array();
	for(var i = 0; i < formatoLength; i++ ) {
		var charLiteral = CM_getIfMaskLiteral(this.formato, i);
		if(charLiteral != "") {
			caracteres[caracteres.length] = charLiteral;
		}
	}
	return caracteres;
}

CampoTelefone.prototype.isMascaraHabilitada = function() {
	return !(this.checkBoxMascara[0].checked);
}
/**
 * Retorna o n�mero m�ximo de caracteres que pode ser digitado no campo.
 */
function CT_getTamanhoMaximo(formato) {
    tamanhoMax = new Number(formato);
    if (isNaN(tamanhoMax) || tamanhoMax == 0) {
        return 999999;
    } else {
        return tamanhoMax;
    }
}

/**
 * Retorna uma mensagem de erro caso o formato do campo n�o for v�lido.
 */
function CT_isFormatoValido(formato, textoDigitado) {
    tamanhoMax = CT_getTamanhoMaximo(formato);

	// ie e opera enxergam uma quebra de linha como \r\n, enquanto os outros browsers assumem \n
    // por isso, faz-se necess�rio tratamento para tornar compat�veis as verifica��es de tamanho do texto
    var tamanhoTexto = String(textoDigitado).split(/\r\n|\n/).join('\r\n').length;

    if (tamanhoTexto > tamanhoMax) {
        return "O campo não pode conter mais que \"" + tamanhoMax + "\" caracteres. ";
    }
    return "";
}

/**
 * Verifica se o valor digitado no campo texto est� correto
 */
function CT_verificaValor(ctrl) {
    msgformato = CT_isFormatoValido(ctrl.getAttribute("formato"), ctrl.value);
    //se n�o for v�lido, limpa o campo e mostra uma mensagem
    var modalNaoEstaPresenteNaTela = document.querySelector('div.blockUI.blockMsg.blockPage') === null
    if (msgformato != "" && modalNaoEstaPresenteNaTela) {
        alert (msgformato + msgKey("label.js.valorDigitado","") + ctrl.value + "\".");
        //ctrl.focus();
        return false;
    }
    return true;
}
/**
 * trata a entrada de teclas de controle de modificacao de conteudo. ctrl-v, shitf-ins, ctrl-x.
 */
function CT_KDN(ctrl, event){
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}
}

/**
 * Trata a digita��o no campo para n�o permitir que o campo fique com
 * valores inv�lidos.
 */
function CT_KPS(ctrl, event) {
	if(C_isTeclasControle(ctrl, event)){
	    return C_valorTeclasControleHandler(ctrl, event);
	}else//Nas situa��es abaixo n�o deve fazer valida��o n�o faz nada
	    if (C_NaoPodeProcessarOnKeyPress(ctrl, event)) {
	        return;
	    }
    //pega a tecla que foi digitada
    tecla = C_TeclaDigitada(event);
    //pega o texto que est� sendo digitado
    textoDigitado = C_getTextoDigitado(ctrl, String.fromCharCode(tecla));
    //Adiciona o caracter est� sendo digitado e verifica se o formato � v�lido
    if (CT_isFormatoValido(ctrl.getAttribute("formato"), textoDigitado) != "") {
        C_CancelaEvento(event);
        return;
    }
}

/** Trata a sa�da do campo para n�o permitir que o campo fique com valores inv�lidos **/
function CT_BLR(ctrl) {
    //verifica se o texto existente no campo � v�lido
    CT_verificaValor(ctrl);
}

function CT_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, msgKey('label.js.valorInvalido',ctrl.value));
	}
}

function CT_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function CT_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}
function CH_check(checkbox){
	checkbox.checked = !(checkbox.checked);
	CH_updateHiddenValue(checkbox);
}

function CH_updateHiddenValue(checkbox){
	if(checkbox.checked){
		CH_getInputSibling(checkbox).value = checkbox.getAttribute('value');
	} else {
		CH_getInputSibling(checkbox).value = checkbox.getAttribute('uncheckedValue');
	}
}

function CH_getInputSibling(obj){
	/*var input = obj.nextSibling;
	while(input != null && input.nodeName != 'INPUT'){
		input = input.nextSibling;
	}
	return input;*/
	// return jQuery(obj).parent().find('input[type=hidden]')[0];
	return jQuery(obj).parent().find('input[type="hidden"][name="'+obj.name+'"]')[0];

}
var CMD_comboTarget

// fired in event onChange
// Ex: onChange="CMD_find(formCad['usuario.id'],'spwPopula.htm?param=1')"
function CMD_find(combo, url){
	CMD_comboTarget = combo;
	iframe = document.createElement("IFRAME");
	iframe.src = url;
	iframe.id = "CMD_iframe";
	iframe.style.display = "none";
	objBody = document.getElementsByTagName("BODY")[0];
	objBody.appendChild(iframe);
}

function CMD_populate(arrayDados) {
	combo = parent.CMD_comboTarget;

	//remove itens
	qtChild = combo.childNodes.length;
	for(i = 0; i < qtChild; i++){
		combo.removeChild(combo.childNodes[0]);
	}

	//add itens
	for(i = 0; i < arrayDados.length; i++){
		option = parent.document.createElement("OPTION");
		option.value = arrayDados[i][1];
		text = parent.document.createTextNode(arrayDados[i][0]);
		option.appendChild(text);
		combo.appendChild(option);
	}

	//delete iframe
	iframe = parent.document.getElementById("CMD_iframe");
	iframe.parentNode.removeChild(iframe);
}

function antesAjustaScrollSearchGrid() {
	// fun��o gancho para ser sobrescrita
}
function depoisAjustaScrollSearchGrid() {
	// fun��o gancho para ser sobrescrita
}

/**
 * Exibe a layer e coloca a altura do layer com scroll
 * */
function ajustaScrollSearchGrid(){
	antesAjustaScrollSearchGrid();

	var objLayer = document.getElementById("laConsulta");
	var tableParent = objLayer.parentNode.parentNode.parentNode.parentNode;
	objLayer.style.height = "1px"; // 0px era o desejado, mas o IE apresenta problemas
	objLayer.style.height = (F_getBrowserHeight() - tableParent.offsetHeight) + "px";
	objLayer.style.display = "";

	depoisAjustaScrollSearchGrid();
}

/**
 * Verifica se cont�m algum iframe da search
 * */
function verificaIframeDiv(){
	var divs = document.getElementsByTagName("DIV");
	for(var i = 0; i < divs.length; i++){
		if(String(divs[i].getAttribute("id")).indexOf("spwConsulta") != -1){
			return true
		}
	}
	return false;

}
/** Cria a caixa de consulta **/
function abrirConsulta(obj, url, largura, altura, titulo){
	if(obj == null || obj.tagName != 'IMG' || (obj.tagName == 'IMG' && IMG_isEnabled(obj))){

		//
		var haveDoctype = F_haveDoctype();
	    var alturaTitulo = 18;

		//verifica se a consulta ja esta aberta(default -> spwConsulta e caso n�o tenha verifica quaquer div que contenha spwConsulta)
		if(document.getElementById("spwConsulta") != null || verificaIframeDiv()) {
			return;
		}

		//pega dados da pag
		var objBody = document.getElementsByTagName("BODY")[0];
		var alturaPag = F_getBrowserHeight();
		var larguraPag = F_getBrowserWidth();
		var posScroll = jQuery(window).scrollTop();

		//cria a layer
		var laConsulta = document.createElement("DIV");
		laConsulta.id = "spwConsulta";
		if(haveDoctype){
			laConsulta.style.position = "fixed";
			posScroll = 0;
		}else{
			laConsulta.style.position = "absolute";
		}
		laConsulta.style.width = largura + "px";
		laConsulta.style.height = altura + "px";
		laConsulta.style.left = ((larguraPag - largura) / 2) +"px";
		laConsulta.style.top = ((alturaPag - altura) / 2 + posScroll) + "px";
		laConsulta.className = "spwTabelaGrid";
		laConsulta.style.backgroundColor = "#ffffff";
		laConsulta.style.zIndex = 99;
	    objBody.appendChild(laConsulta);

		//cria a tabela superior
		tabelaCons = document.createElement("TABLE");
		tabelaCons.cellPadding = 0;
		tabelaCons.cellSpacing = 0;
		tabelaCons.style.width = '100%';
		tabelaCons.className = "spwTituloGrid";
		cabCons = document.createElement("TBODY");
		tabelaCons.appendChild(cabCons);

		//cria a linha da tabela
		linhaCons = document.createElement("TR");
		cabCons.appendChild(linhaCons);

		//cria a primeira celula
		celula1Cons = document.createElement("TD");
		celula1Cons.height = alturaTitulo;
		linhaCons.appendChild(celula1Cons);
		texto1 = document.createTextNode(titulo);
		celula1Cons.appendChild(texto1);
		objBody.onmousemove = moverLayer;
		celula1Cons.onmousedown = iniciaMover;
		objBody.onmouseup = terminaMover;

		//cria a segunda celula
		celula2Cons = document.createElement("TD");
		linhaCons.appendChild(celula2Cons);

		celula2Cons.style.width = '20px';
		laConsulta.appendChild(tabelaCons);

		//
	    var botaoFechar = document.createElement("a");
	    botaoFechar.className = "spwBotaoFecharJanela";
	    botaoFechar.appendChild(document.createTextNode('X'));
	    botaoFechar.onclick = fecharConsulta;
		celula2Cons.appendChild(botaoFechar);

		//cria tabela para conter o iframe
		tabelaIframe = document.createElement("TABLE");
		linhaIframe = document.createElement("TR");
		celulaIframe = document.createElement("TD");
		tabelaIframe.id = "tabelaIframe";

	    //Atualiza os par�metros
	    prmIdObjRetorno="idObjRetorno="+obj.id;
	    grid = getGrid(obj);

	    if (grid != null && gridIsMultiselection(grid)) {
	        prmMultiSelection="multiselection=true&contador=0&gotInputParam=false&contadorMaior=0";
	    } else {
	        prmMultiSelection="multiselection=false";
	    }

		url = insertParamUrlAntesConsulta(url,obj.id);

	    if (url.indexOf("?") < 0) {
	        url=url+"?";
	    } else {
	        url=url+"&";
	    }

	    var desabilitaSel = obj.getAttribute('desabilitarSelecionados');
	    if((new String(desabilitaSel)).toLowerCase() != "false" && (new String(desabilitaSel)).toLowerCase() != "true"){
	    	desabilitaSel = false;
	    }

	    url=url+prmIdObjRetorno+"&"+prmMultiSelection+"&height="+(altura-alturaTitulo)+"&desabilitarSelecionados="+desabilitaSel;

		//cria o iframe
		if( navigator.appName == "Netscape" ) {
			iframeConsulta = document.createElement("iframe");
			iframeConsulta.src = url;
			iframeConsulta.width = "100%";
			iframeConsulta.height = altura - alturaTitulo;
			iframeConsulta.frameBorder = "0";
	        iframeConsulta.id = "layerFormConsulta";
			laConsulta.appendChild(iframeConsulta);
		} else {
	        htmlIframe = "<iframe id='layerFormConsulta' frameBorder='0' style='width:100%; height:" + (altura - alturaTitulo) + "px' src='"+url+"'></iframe>";
			document.getElementById("spwConsulta").insertAdjacentHTML("beforeEnd", htmlIframe);
		}
	}
}

function insertParamUrlAntesConsulta(url,sender){
	return url;
}


/** desabilita a selecao do texto quando esta movendo **/
document.onselectstart = doc_selstart;
function doc_selstart(aEvent) {
    var theEvent = aEvent ? aEvent : window.event;
    if (movendo){
        theEvent.returnValue = false;
    }
}

/** Faz com que o ESC feche a tela **/
document.onkeydown = doc_keydown;
function doc_keydown(aEvent){
    var theEvent = aEvent ? aEvent : window.event;
    if (theEvent.keyCode == 27) {
        fecharConsulta();
        try{
  			procuraFechaIFrame();
  		}catch(e){
  		   //N�o realiza nenhuma a��o, iframe n�o existente
  		}
    }
}

/**
 * Fecha o primeiro iframe encontrado e que contenha "spwConsulta" no seu id
 * */
function procuraFechaIFrame(){
	var iframes = parent.document.getElementsByTagName('IFRAME');
  	var doc = parent.document;
	if(iframes != null && iframes[0] != null){
	    var pai = iframes[0].parentNode;
	    while(pai != null && String(pai.nodeName) != "DIV"){
			pai = pai.parentNode;
		}
		if(pai != null){
			var id = pai.getAttribute('id');
			if(id != null && String(id).indexOf('spwConsulta') != -1){
				pai.parentNode.removeChild(pai);
				objBody = doc.getElementsByTagName("BODY")[0];
		  		objBody.onmouseup = null;
		  		objBody.onmousemove = null;
		    }
		}
    }else{
    	iframes = document.getElementsByTagName('IFRAME');
    	doc = document;
    	if(iframes != null && iframes[0] != null){
	    	var pai = iframes[0].parentNode;
	    	while(pai != null && String(pai.nodeName) != "DIV"){
				pai = pai.parentNode;
			}
			if(pai != null){
				var id = pai.getAttribute('id');
				if(id != null && String(id).indexOf('spwConsulta') != -1){
					pai.parentNode.removeChild(pai);
					objBody = doc.getElementsByTagName("BODY")[0];
			  		objBody.onmouseup = null;
			  		objBody.onmousemove = null;
			    }
			}
		}
   	}
}

function fecharConsulta(){
	fecharConsultaById('');
}

/** Fecha a caixa de consulta **/
function fecharConsultaById(id) {
	onclosewindow();
	var idIframe;
	if ((id != null) && (id != undefined) && (id != "")) {
		idIframe = jQuery.trim(("spwConsulta"+id));
	} else {
		idIframe = getIdIframe();
	}

	layerCon = parent.document.getElementById(idIframe);
    var doc = parent.document;
    if (layerCon == null) {
       layerCon = document.getElementById(idIframe);
       doc = document;
    }
    if (layerCon != null) {
      layerCon.parentNode.removeChild(layerCon);
      objBody = doc.getElementsByTagName("BODY")[0];
      objBody.onmouseup = null;
      objBody.onmousemove = null;
    }

    var idObjRetorno = document.getElementById("idObjRetorno");
    if (idObjRetorno) {
        var objRetorno = doc.getElementById(idObjRetorno.value);
        if (objRetorno) {
            try {
            	objRetorno.focus();
            } catch(e) {}
        }
    }
}

function getIdIframe() {
	if (document.getElementById('idObjRetorno')) {
		var objRetornoValue = document.getElementById('idObjRetorno').value;
		var objTable = parent.document.getElementById(objRetornoValue);
		idIframeAttribute = objTable.getAttribute('idIframe');
		if (idIframeAttribute) {
			idIframe = jQuery.trim("spwConsulta"+idIframeAttribute);
			return idIframe;
		} else {
			idIframe = "spwConsulta";
			return idIframe;
		}
	} else {
		idIframe = "spwConsulta";
		return idIframe;
	}
}

function converteNumero(texto) {
    texto = new String(texto);
    numero = "";
    for (i = 0; i < texto.length; i++) {
        carac = texto.substr(i,1);
        if(!isNaN(carac) || carac == "." || carac == ","){
            numero += carac;
        }
    }
    return new Number(numero);
}

var posXinicial;
var posYinicial;
var movendo = false;
var posXlayer;
var posYlayer;

/** seta as variaveis quando clicado no titulo da consulta **/
function iniciaMover(aEvent){
    var theEvent = aEvent ? aEvent : window.event;
    movendo = true;
    posXinicial = new Number(theEvent.clientX + document.body.scrollLeft);
    posYinicial = new Number(theEvent.clientY + document.body.scrollTop);
    layerConsulta = document.getElementById("spwConsulta");
    if (layerConsulta === null) {
    	layerConsulta = document.getElementById(_idIframeConcat);
    }
    posXlayer = converteNumero(layerConsulta.style.left);
    posYlayer = converteNumero(layerConsulta.style.top);
}

/** exibe o conteudo da consulta quanto termina de mover **/
function terminaMover(){
	document.getElementById("layerFormConsulta").style.display = "";
	movendo = false;
}

/** move a layer **/
function moverLayer(aEvent){
    var theEvent = aEvent ? aEvent : window.event;
    if (movendo == true) {
        document.getElementById("layerFormConsulta").style.display = "none";
        currentX = new Number(theEvent.clientX + document.body.scrollLeft);
        currentY = new Number(theEvent.clientY + document.body.scrollTop);
        layerConsulta = document.getElementById("spwConsulta");
        if (layerConsulta === null) {
        	layerConsulta = document.getElementById(_idIframeConcat);
        }
        layerConsulta.style.left = posXlayer + (currentX - posXinicial);
        layerConsulta.style.top = posYlayer + (currentY - posYinicial);
    }
}

//limpa o grid de pesquisa
function limparGrid() {
	tabela = getTBody(document.getElementById("tabelaResultado"));
	if(tabela != null){
		grid = getGrid(tabela);
		nmGrid = getNomeGrid(grid);
		qtFilhos = tabela.childNodes.length;
		for (var i = 0; i < qtFilhos; i++) {
			tabela.removeChild( tabela.lastChild );
		}
    	document.getElementById("textQtLinhas"+nmGrid).childNodes[0].nodeValue = "0";
    }
}

//limpa a tabela referente aos dados da pagina��o
function limparDadosPaginacao(){
	if(jQuery('#painelNavegacao')[0]) {
		jQuery('#painelNavegacao')[0].style.display = 'none';
	}
	if(jQuery('#infoExibindo')[0]) {
		jQuery('#infoExibindo')[0].style.display = 'none';
	}
}

//limpa o conte�do dos filtros de pesquisa
function limparFiltros( theForm ) {
    objForm = document.forms[0];
    var length = objForm.length;
	for (i = 0; i < length; i++) {
    	if (objForm[i].name != "" && objForm[i].type != "button" && objForm[i].type != "submit" && objForm[i].type != "hidden") {
            if (objForm[i].type == "checkbox") {
                objForm[i].checked = false;
            } else {
                objForm[i].value = "";
            }
        }
	}
}

//verifica se existe pelo menos um filtro de pesquisa preenchido
function filtroPesquisaValido( form ) {
    //Comentado a pedido da salt 31003.
    /*ok = false;
    for( i = 0; i < form.length; i++ ) {
        if( form[i].type == "text" || form[i].type == "select" ) {
            if( form[i].value != "" ) {
                ok = true;
            }
        }
    }
    if( !ok ) {
        alert("� necess�rio informar algum filtro para a pesquisa.");
    }
    return ok;*/
    return true;
}

function verificaCamposObrigatorios(form){
	var length = form.length;
	for( i = 0; i < length; i++ ) {
        if( form[i].type == "text" && form[i].getAttribute('obrigatorio') != null && (form[i].getAttribute('obrigatorio')).toUpperCase() == "TRUE") {
            if(!C_verificaObrigatorio(form[i])) {
                return false;
            }
        }
    }

    return true;
}

function executePesquisaDB( form ) {
	if(!isSearchFilterValid()){
		document.getElementById('pbProcurar').disabled = false;
    	return;
	}

    if (filtroPesquisaValido( form )) {
    	if(verificaCamposObrigatorios(form)){
        	IS_restauraEstadoSelecao();
        	/* Foi comentado devido a salt 33604, aguardando cliente SAJ
            var formURL = document.getElementById("requesterUrl");
            if(formURL) {
                var valorCampo = formURL.value;
                if(valorCampo) {
                    var index = valorCampo.indexOf('/search/');
                    if(index > 0) {
                        formURL.value = valorCampo.substr(index);
                    }
                }
            }*/
        	form.submit();
    	}else{
    		document.getElementById('pbProcurar').disabled = false;
    		return false;
    	}
    }
}

function selecionarRegistros() {
	var selecionados = pegaSelecionados( document.forms[0] );
	var objRetorno = parent.document.getElementById(idObjRetorno);
	var idIframe = '';
    if(isInputSelect(objRetorno)){
    	idIframe = objRetorno.getAttribute('idIframe');
    	if(selecionados.length == 0) {
    		if(objRetorno.getAttribute('multiplaSelecao') == 'true'){
        		copiarParaInputSelect(objRetorno,selecionados);
        	} else {
        		copiarParaForm(selecionados);
        	}
    		parent.desabilitaInputsFilhos(objRetorno, parent.document);
    		var selecionadosInput = document.getElementById(idObjRetorno+'SelectedEntitiesList').value;
    		if (selecionadosInput != "") {
        		parent.depoisSelecionarRegistros(idObjRetorno);
        	}
    		fecharConsultaById(idIframe);
    		return;
    	} else if(objRetorno.getAttribute('multiplaSelecao') == 'true'){
    		copiarParaInputSelect(objRetorno,selecionados);
    	} else {
    		copiarParaForm(selecionados);
    	}
    	parent.setOldValueInputSelect(objRetorno.id);
		if(temFilho(objRetorno)){
			parent.habilitaInputsFilhos(objRetorno, parent.document);
			parent.carregaISFilho(idObjRetorno, true);
		}
		if (objRetorno.getAttribute('multiplaselecao') === "false") {
			var input = parent.jQuery(objRetorno).find('input').get(1);
			if (input) {
				if(input.style.display.toString() == '') {
					try {
						input.focus();
					} catch(e) {}
				}
			}
		}
    }else{
	    grid = getGrid(objRetorno);
	    if (grid != null) {
	        var selecionadosList = IS_getInputParamValue(document,idObjRetorno);
	        if (selecionadosList == null || selecionadosList == "") {
		        if(selecionados.length == 0) {
		        	alert(msgKey("label.js.selecaoVazia",""));
			        return;
		        }else{
		        	copiarParaGrid(grid,objRetorno,selecionados);
		        }
			}
	        copiarParaGridSearchPaginada(grid, objRetorno);
	    } else {
	    	if (selecionados.length == 0) {
		        alert(msgKey("label.js.selecaoVazia",""));
		        return;
			}
	        copiarParaForm(selecionados);
	    }
	}
//Funciona como um evento para que possa ser "sobrescrito" na p�gina
//Deve ficar antes de fechar a consulta sen�o o script n�o funciona, pois
//o iFrame � destru�do antes de chegar na executar da fun��o
    parent.depoisSelecionarRegistros(idObjRetorno);
//Fecha a tela de consulta
    if (objRetorno) {
    	try {
    		objRetorno.focus();
    	} catch(e) {}
    }

    fecharConsultaById(idIframe);
}

//Copia os registros para um inputSelect..
function copiarParaInputSelect(objRetorno,selecionados){
	var parentDoc = parent.document;
	var contador = getContadorValue(document,'');
	var inputs = objRetorno.getElementsByTagName('INPUT');
	parent.limparInputSelect(objRetorno.id);
	if(contador == 0){
		habilitaInputSelect(objRetorno, parent.document);
	} else if(contador == 1){
		habilitaInputSelect(objRetorno, parent.document);
		if(selecionados.length > 0){
			copiarParaCampos(selecionados);
		}else{
			var registro = IS_inputParamToArray(document, objRetorno.id)[0];
			registro = registro.substring(registro.indexOf('^')+1);
			var linha = document.getElementById( "linha_0");
	        var nodosRef = pegaReferencias( linha );
	        for( j = 0; j < nodosRef.length; j++ ) {
				var propriedadeValor = "";

				if(registro.indexOf('^') != -1) {
					propriedadeValor = registro.substring(0,registro.indexOf('^'));
				} else {
					propriedadeValor = registro.substring(0,registro.indexOf('$'));;
				}

				var valor = propriedadeValor.substring(propriedadeValor.indexOf('=')+1);

		       	var pageReference = getAttribute(nodosRef[j], 'pageReference');
		        copiaValorColunaParaForm(getAttribute(nodosRef[j], 'reference'), valor, pageReference);

				if(registro.indexOf('^') != -1) {
					registro = registro.substring(registro.indexOf('^')+1);
				} else {
					registro = null;
				}
			}
		}
	} else{
		var c = -1;
		for(var i = inputs.length -1; i >= 0; i--){
			if(inputs[i].type!='hidden'){
				parent.disable(inputs[i]);
				if(inputs[i].offsetHeight != 0 && c == -1){
					c = i;
				}
			}
		}
		inputs[c].value=contador+' Registros selecionados';

	}

	var divsExistentes = objRetorno.getElementsByTagName('DIV');
	for(var k = 0; k < divsExistentes.length; k++){
		if(divsExistentes[k].getAttribute('multSelecao') == 'true'){
			divsExistentes[k].parentNode.removeChild(divsExistentes[k]);
			k--;
		}
	}

	var inputParamArray = IS_inputParamToArray(document, objRetorno.id);
	for(var i = 0; i < inputParamArray.length; i++) {
		var divMetadado = inputParamArray[i];
		var div = createDivFromMetadata(parentDoc,divMetadado);
		objRetorno.appendChild(div);
	}

	var parentContador = parentDoc.getElementById('contador'+objRetorno.id);
	parentContador.value = document.getElementById('contador').value;
	var parentInputParam = parentDoc.getElementById(objRetorno.id+'SelectedEntitiesList');
	parentInputParam.value = document.getElementById(objRetorno.id+'SelectedEntitiesList').value;
	var parentContadorMaior = parentDoc.getElementById('contadorMaior'+objRetorno.id);
	parentContadorMaior.value = document.getElementById('contadorMaior').value;

}

function createDivFromMetadata(doc,metadata){
	var divId = metadata.substring(0,metadata.indexOf('^'));
	var novoDiv = doc.createElement("DIV");
	novoDiv.id = divId;
	novoDiv.style.display = 'none';
	novoDiv.setAttribute('multSelecao','true');

	var resto = metadata.substring(metadata.indexOf('^') + 1);
	while(resto != null && resto != ''){
		var indexChapeu = resto.indexOf('^');
		var input = '';
		if(indexChapeu != -1) {
			input = resto.substring(0,indexChapeu);
			resto = resto.substring(resto.indexOf('^')+1);
		} else {
			input = resto.substring(0,resto.indexOf('$'));
			resto = null;
		}
		var name = input.substring(0,input.indexOf('='));
		var value = url_decode(input.substring(input.indexOf('=')+1));

		var novoInput = criaElemento(doc,'INPUT','HIDDEN',name,name, value,name);
		novoDiv.appendChild(novoInput);

	}
	return novoDiv;
}

function getSelectedDivs(doc,objId){
	var divs = IS_getDivTemp(doc,objId).getElementsByTagName('DIV');
	var divArray = new Array();
	for(var j = 0; j < divs.length; j++){
		if(divs[j].getAttribute('multSelecao') == 'true'){
			divArray[divArray.length] = divs[j];
		}
	}
	return divArray;
}

function cloneDiv(doc, div){
	var novoDiv = doc.createElement("DIV");
	novoDiv.id = div.id;
	cloneInputsHidden(doc,div,novoDiv);
	novoDiv.style.display = 'none';
	novoDiv.setAttribute('multSelecao','true');
	return novoDiv;
}

function cloneInputsHidden(doc, divFonte, divAlvo){
	for(var i = 0; i < divFonte.childNodes.length; i++){
		if(divFonte.childNodes[i].nodeName == 'INPUT'){
			var input = divFonte.childNodes[i];
			var novoInput = criaElemento(doc,'INPUT','HIDDEN',input.name,input.id,input.value,input.getAttribute('property'));
			novoInput.setAttribute('remover',input.getAttribute('remover'));
			divAlvo.appendChild(novoInput);
		}
	}
}

//Copia uma linha do form de consulta para o form que o chamou
function copiarParaCampos(selecionados) {
    for( i = 0; i < selecionados.length; i++ ) {
        linhaSel = document.getElementById( "linha_" + selecionados[ i ] );
        nodosRef = pegaReferencias( linhaSel );
        for( j = 0; j < nodosRef.length; j++ ) {
       	    var valorRetorno = url_decode(SR_getValorCelulaSearch(nodosRef[j]));
       	    var pageReference = getAttribute(nodosRef[j], 'pageReference');
            copiaValorColunaParaCampos(getAttribute(nodosRef[j], 'reference'), valorRetorno, pageReference);
        }
    }
}

//copia o valor de uma coluna da tela de consulta para um campo do form que o chamou
function copiaValorColunaParaCampos(coluna, valor, pageReference) {
    var idDoElemento;
    if(pageReference == null || pageReference == "false"){
	    idDoElemento = parent.nomeCampoEquivalenteInputSelect(idObjRetorno, coluna);
	} else {
		idDoElemento = coluna;
	}
    if ((idDoElemento != null) && (idDoElemento != "")) {
      var obj = parent.IS_getInputFromInputSelect(idObjRetorno, idDoElemento);
      if(obj != null){
	      obj.value = valor;
	  }

      // limpa a classe 'erro' caso o campo estivesse com erro antes da copia
      if(obj.className.indexOf('erro')!=-1){
    		obj.className=obj.className.substring(0,obj.className.indexOf('erro'));
  	  }
    }
}


//Copia uma linha do form de consulta para o form que o chamou
function copiarParaForm(selecionados) {
    for( i = 0; i < selecionados.length; i++ ) {
        linhaSel = document.getElementById( "linha_" + selecionados[ i ] );
        nodosRef = pegaReferencias( linhaSel );
        for( j = 0; j < nodosRef.length; j++ ) {
       	    var valorRetorno = url_decode(SR_getValorCelulaSearch(nodosRef[j]));
       	    var pageReference = getAttribute(nodosRef[j], 'pageReference');
            copiaValorColunaParaForm(getAttribute(nodosRef[j], 'reference'), valorRetorno, pageReference);
        }
    }
}

//copia o valor de uma coluna da tela de consulta para um campo do form que o chamou
function copiaValorColunaParaForm(coluna, valor, pageReference) {
	var idDoElemento;
	var objRetorno = parent.document.getElementById(idObjRetorno);
	var bindings = objRetorno.getAttribute('bindings');
	if(bindings == null || bindings == ''){
	    idDoElemento = parent.nomeCampoEquivalenteForm(idObjRetorno, coluna);
	} else {
		if(pageReference == null || pageReference == "false"){
			return;
		}
		idDoElemento = coluna;
	}
    if ((idDoElemento != null) && (idDoElemento != "")) {
    	var obj = null;
    	if(isInputSelect(objRetorno)) {
			obj = parent.IS_getInputFromInputSelect(idObjRetorno, idDoElemento);
			if(obj != null){
	      		// obj.value = url_decode(valor);
				obj.value = valor;
	  		}
    	} else {
      		obj = F_getElementByNameOrId(parent.document, idDoElemento);
      		if(obj != null){
	      		// obj.value = url_decode(valor);
      			obj.value = valor;
	  		}
	  	}

    	// limpa a classe 'erro' caso o campo estivesse com erro antes da copia
    	if(obj.className.indexOf('erro')!=-1){
    		obj.className=obj.className.substring(0,obj.className.indexOf('erro'));
    	}
    }
}


//M�todo pode ser "sobrescrito" para modificar os nomes das colunas correspondentes
function nomeCampoEquivalenteForm(sender, coluna) {
	return coluna;
}

//copia uma linha do form de consulta para o grid
function copiarParaGrid(grid, objRetorno, selecionados) {
    var nmGrid = getNomeGrid(grid);
    var nuLinhaNova = new Number( parent.document.getElementById("textQtLinhas"+nmGrid).childNodes[0].nodeValue );
    for( i = 0; i < selecionados.length; i++ ) {
       var linhaSel = document.getElementById( "linha_" + selecionados[ i ] );
	   if(String(linhaSel.getAttribute('disabled')) == 'true') {
       		continue;
       }
       var nodosRef = pegaReferencias( linhaSel );
       var linha = parent.criarLinha(objRetorno, i == selecionados.length-1, false );
       var actionChanged = false;
       for( j = 0; j < nodosRef.length; j++ ) {
       	    var valorRetorno = url_decode(SR_getValorCelulaSearch(nodosRef[j]));
       	    var pageReference = getAttribute(nodosRef[j], 'pageReference');
       	    var obj = copiaValorColunaParaGrid(grid, nuLinhaNova, references[j], valorRetorno, pageReference);
            if(obj != null && !(actionChanged)){
	       	    parent.changeActionGridInsert(grid,nuLinhaNova);
	       	    actionChanged = true;
       	    }
        }
        linha.style.display = '';
        nuLinhaNova++;
    }
}

function copiarParaGridSearchPaginada(grid, objRetorno) {
    var nmGrid = getNomeGrid(grid);
    var nuLinhaNova = new Number( parent.document.getElementById("textQtLinhas"+nmGrid).childNodes[0].nodeValue );
    var inputParamArray = IS_inputParamToArray(document, objRetorno.id);
    for( var i = 0; i < inputParamArray.length; i++) {
	   var registroSelecionado = inputParamArray[i];
       var valoresSelecionados = getValoresSelecionados(registroSelecionado);

       if(isToCopy(idObjRetorno, nmGrid, registroSelecionado)){
	       var linha = parent.criarLinha(objRetorno, i == inputParamArray.length-1 ,false);
	       var actionChanged = false;
	       for( j = 0; j < valoresSelecionados.length; j++ ) {
	       	    var valor = valoresSelecionados[j];
	       	    var pageReference = pageReferences[j];
	       	    var obj = copiaValorColunaParaGrid(grid, nuLinhaNova, references[j], valor, pageReference);
	       	    if(obj != null && !(actionChanged)){
		       	    parent.changeActionGridInsert(grid,nuLinhaNova);
		       	    actionChanged = true;
	       	    }
	       	}
	       	linha.style.display = '';
	        nuLinhaNova++;
        }
    }
}

function isToCopy(sender, nmGrid, registroSelecionado){
	var handler = new GridHandler(nmGrid,parent.document);
    var gridSize = handler.size();
    var existe = false;

    if(gridSize > 0){
	   	var linhaSel = document.getElementById( "linha_0" );
	    var nodosRef = pegaReferencias( linhaSel );
	    var camposChave = getCamposChaveSearch(nodosRef);
		var searchKeys = camposChave.keys();
	   	var searchKeysLength = searchKeys.length;

	    var keys = "";
	    for(var k = 0; k < searchKeysLength; k++ ) {
			if(k+1 == searchKeysLength){
				keys += searchKeys[k];
			}else{
				keys += searchKeys[k]+";";
			}
		}

		existe = isCamposDuplicadosGridParent(nmGrid,keys,registroSelecionado);
    }

	return (!existe);
}

//copia o valor de uma coluna da tela de consulta para uma coluna da grid
function copiaValorColunaParaGrid(grid, nuLinhaNova, coluna, valor, pageReference) {
	var inputId;
	if(pageReference == null || pageReference == "false"){
		inputId = parent.nomeCampoEquivalenteGrid(idObjRetorno, coluna);
	} else {
		inputId = coluna;
	}
    if( inputId != null) {
        var idDoElemento = getColumnId(grid, inputId, nuLinhaNova);
       var obj = parent.document.getElementById( idDoElemento );
        if(obj != null){
        	obj.value = url_decode(valor);
        	return obj;
        }
    }
    return null;
}

function getValoresSelecionados(registro){
	var valores = new Array();
	var resto = registro.substring(registro.indexOf('^') + 1);
	while(resto != null && resto != ''){
		var indexChapeu = resto.indexOf('^');
		var input = '';
		if(indexChapeu != -1) {
			input = resto.substring(0,indexChapeu);
			resto = resto.substring(resto.indexOf('^')+1);
		} else {
			input = resto.substring(0,resto.indexOf('$'));
			resto = null;
		}
		valores[valores.length] = input.substring(input.indexOf('=')+1);
	}
	return valores;

}

//M�todo pode ser "sobrescrito" para modificar os nomes das colunas correspondentes
function nomeCampoEquivalenteGrid(sender, coluna) {
	return coluna;
}

//referencias das colunas para os campos no grid
function pegaReferencias( linha ) {
    referencias = new Array();
    count = 0;
    for( j = 0; j < linha.childNodes.length; j++ ) {
        if((!isTextNode(linha.childNodes[j])) && (getAttribute(linha.childNodes[j], 'property') != null)) {
            referencias[count] = linha.childNodes[j];
            count++;
        }
    }
    return referencias;
}

//retorna os itens selecionados do grid de pesquisa
function pegaSelecionados( form ) {
    checados = new Array();
    if (form.rowSelect != null) {
        max = form.rowSelect.length;
        cont = 0;
        if (max!=null) {
            for( i = 0; i < max; i++) {
                if (form.rowSelect[i].checked == true) {
                    checados[cont] = form.rowSelect[i].value;
                    cont++;
                }
            }
        } else {
            if (form.rowSelect.checked == true) {
                  checados[0] = form.rowSelect.value;
            }
        }
    }
    return checados;
}

function mudarSelecaoTodos( form, marcado, multSelecao ) {
    if (form.rowSelect != null) {
        var max = form.rowSelect.length;
        if (max!=null) {
            for( var i = 0; i < max; i++) {
               if(form.rowSelect[i].checked != marcado && form.rowSelect[i].disabled == false){
               		form.rowSelect[i].checked = marcado;
               		if(multSelecao){
               			onClickMultiplaSelecao(form.rowSelect[i]);
               		}
               }
            }
        } else {
             if(form.rowSelect.checked != marcado && form.rowSelect.disabled == false){
             	form.rowSelect.checked = marcado;
		        if(multSelecao){
		           	onClickMultiplaSelecao(form.rowSelect);
		        }
             }
        }
    }
}

function getIndexRow(objTR){
	var idObjTr = objTR.getAttribute('id');
	var table = objTR.parentNode;
	while(table.nodeName != 'TABLE'){
		table = table.parentNode;
	}
	var filhos = table.childNodes;
	for(var i = 0; i < filhos.length; i++){
		filho = filhos[i];
		if(filho.getAttribute('id') == idObjTr){
			return i;
		}
	}
	return null;
}

function mudarSelecaoRegistroAtual(objTR) {
    if (objTR != null) {
		var objRadio = objTR.getElementsByTagName('INPUT')[0];
       	objRadio.checked = true;
       	var grid = getGrid(objTR);
       	grid.setAttribute('selected', objTR.getAttribute('id'));
    }
}

function alterneSelecaoRegistroAtual(objTD, doc, isInputSelect) {
    if (objTD != null) {
    	var objTR = objTD.parentNode;
		var objCheck = objTR.getElementsByTagName('INPUT')[0];
       	objCheck.checked = !objCheck.checked;
       	if(isInputSelect){
       		onClickMultiplaSelecao(objCheck);
       	}
    }
}

function alterneSelecaoRegistroAtualDoubleClick(objTD, doc) {
    if (objTD != null) {
    	var objTR = objTD.parentNode;
		var objCheck = objTR.getElementsByTagName('INPUT')[0];
		//objCheck.checked = true;
       	onClickMultiplaSelecao(objCheck);
    }
}

function selecionarRegistroAtual(objTR) {
	mudarSelecaoRegistroAtual(objTR);
	selecionarRegistros();
}

/** Chamado qdo for selecionado um registro de uma searchGrid **/
function depoisSelecionarRegistros(sender) {
}

// SR_ para fun��es relacionadas a search
function SR_getSearchInputs(vassoura){
	var objTable = vassoura;
	while(objTable.nodeName != "TABLE"){
		objTable = objTable.parentNode;
	}
	return objTable.getElementsByTagName("INPUT");
}

function SR_antesLimparCampos(vassoura){
	return true;
}

function SR_depoisLimparCampos(vassoura){
}

function SR_getBotaoProcurar(searchId){
	return document.getElementById(searchId);
}

function SR_getBotaoLimpar(searchId){
	return document.getElementById(searchId + '_limpar');
}

function SR_habilitaBotaoLimpar(searchId, habilitado){
	IMG_enable(SR_getBotaoLimpar(searchId), habilitado);
}

function SR_habilitaBotaoProcurar(searchId, habilitado){
	IMG_enable(SR_getBotaoProcurar(searchId), habilitado);
}

function SR_habilitaBotoes(searchId, habilitado){
	SR_habilitaBotaoLimpar(searchId, habilitado);
	SR_habilitaBotaoProcurar(searchId, habilitado);
}

function limpaCampos(obj){
	if(IMG_isEnabled(obj)){
		if(SR_antesLimparCampos(obj)){
			var arrayInput = SR_getSearchInputs(obj);
			for(i = 0; i < arrayInput.length; i++){
				arrayInput[i].value = "";
			}
			SR_depoisLimparCampos(obj);
		}
	}
}

/** M�todo para ser sobrescrito para tratar o evento de fechamento da janela de consulta **/
function onclosewindow(){
}

function SR_limparConsulta(){
	limparGrid();
	limparDadosPaginacao();
	limparFiltros(document.forms[0]);
    FF_desabilitaBotoes(document.forms[0]);

    var btProcurar = document.getElementById('pbProcurar');
    var btLimpar = document.getElementById('pbLimpar');
    var btFechar = document.getElementById('pbFechar');

    btProcurar.disabled = false;
    if(btProcurar.getAttribute('oldClassName') != null){
		btProcurar.className = btProcurar.getAttribute('oldClassName');
	}

	btLimpar.disabled = false;
    if(btLimpar.getAttribute('oldClassName') != null){
		btLimpar.className = btLimpar.getAttribute('oldClassName');
	}

	btFechar.disabled = false;
    if(btFechar.getAttribute('oldClassName') != null){
		btFechar.className = btFechar.getAttribute('oldClassName');
	}
}

function SR_getValorCelulaSearch(celula){
	var valorRetorno = "";
   	var isHidden = getAttribute(celula, 'oculto');
   	if(isHidden != null && isHidden == "true") {
    	valorRetorno = getAttribute(celula, 'beanValue');
   	} else {
       	if(celula && celula.childNodes[0]){
	  	    valorRetorno = celula.childNodes[0].nodeValue;
	   	}
   	}
   	//alert(valorRetorno +" - "+ url_encode(valorRetorno));
   	return url_encode(valorRetorno);
}

function SR_getValorCelulaSearchDoPadrao(celula){
	var valorRetorno = "";
   	var isHidden = getAttribute(celula, 'oculto');
   	if(isHidden != null && isHidden == "true") {
    	valorRetorno = getAttribute(celula, 'beanValue');
   	} else {
       	if(celula && celula.childNodes[0]){
	  	    valorRetorno = celula.childNodes[0].nodeValue;
	   	}
   	}
   	//alert(valorRetorno +" - "+ url_encode(valorRetorno));
   	if (valorRetorno === null) {
   		return valorRetorno;
   	}
   	return url_encode(url_encode(valorRetorno));
}

var reqMarcarTodosAjax;
var selecionarItens;
function SR_selecionaTodosAjax(selecionar){

	FF_desabilitaBotoes(document.forms[0]);
	selecionarItens = selecionar;
	var url = getSelecionarTodosServletUrl();

	if (window.XMLHttpRequest) {
		reqMarcarTodosAjax = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		reqMarcarTodosAjax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	reqMarcarTodosAjax.open("GET", url, true);
	reqMarcarTodosAjax.onreadystatechange = SR_selecionaTodosAjaxResponse;
	reqMarcarTodosAjax.send(null);
}

function SR_selecionarTodosLimite() {
	alert(resourceMap.getResource('label.js.search.limiteSelecionarTodos'));
}

function SR_limparSelecaoTotal() {
	var	idObjRetorno = document.getElementById('idObjRetorno').value;
	IS_clearInputParamValue(document,idObjRetorno);
	IS_zeraContadorSelecionados(document,"");
	mudarSelecaoTodos(document.forms[0], false, false);
}


function SR_selecionaTodosAjaxResponse(){
	if (reqMarcarTodosAjax.readyState == 4) {
		if (reqMarcarTodosAjax.status == 200) {
		    if( !exceptionTagPresent(reqMarcarTodosAjax) ) {
		      	var entidades = reqMarcarTodosAjax.responseXML.getElementsByTagName('isr')[0].childNodes[0];
				if(entidades && entidades.childNodes.length != 0){
					var	idObjRetorno = document.getElementById('idObjRetorno').value;
					var registrosSelecionados = IS_getInputParamValue(document,idObjRetorno);
					var entidadesChildNodesLength = entidades.childNodes.length;
					var parentDocument = parent.document;
					var ehInputSelect = isInputSelect(parentDocument.getElementById(idObjRetorno));
					var adicionarNoInputParam = [];
					for(var i = 0; i < entidadesChildNodesLength; i++){
						var registro = entidades.childNodes[i];
						var chave = "";
						var atributos = "";
						var registroChildNodesLength = registro.childNodes.length;
						for(var j = 0; j < registroChildNodesLength; j++) {
							var atributo = registro.childNodes[j];
							var nome = atributo.getAttribute('n');
							if(ehInputSelect){
								var property = document.getElementById('multSelecaoProperty').value;
								var indice = getContadorMaiorValue(document,'');
								nome = property+'['+indice+'].'+nome;
							}
							var valor = atributo.getAttribute('v');
							var pk = atributo.getAttribute('pk');
							if(pk != null && pk == 'true'){
								chave += url_encode(valor) + ";";
							}
							atributos += "^" + nome + "=" + url_encode(valor);
						}
						var divId = IS_createMultSelecaoDivId(idObjRetorno,chave);
						if(selecionarItens){
							if(registrosSelecionados == null || registrosSelecionados.indexOf(divId) == -1) {
								adicionarNoInputParam.push('DivID='+divId+atributos+"$");
								incrementaContadorSelecionados(document,'');
							}
						} else {
							if(registrosSelecionados != null && registrosSelecionados.indexOf(divId) != -1) {
								var posicao = registrosSelecionados.indexOf("DivID="+divId+'^');
								if(posicao > -1){
									var subV = registrosSelecionados.substring(posicao,registrosSelecionados.length);
									var resto = subV.substring(subV.indexOf('$')+1,subV.length);
									registrosSelecionados = registrosSelecionados.substring(0,posicao) + resto;
								}
								decrementaContadorSelecionados(document,'');
							}
						}
					}
					if(selecionarItens){
						addToInputParam(document,idObjRetorno,adicionarNoInputParam.join(""));
					} else {
						 var inputParam = document.getElementById(idObjRetorno+'SelectedEntitiesList');

						 if ( registrosSelecionados != null ) {
                            inputParam.value = registrosSelecionados;
                        }
					}
					mudarSelecaoTodos(document.forms[0], selecionarItens, false);
					FF_habilitaBotoes(document.forms[0]);
				}
			}
		}
	}
}

function desabilitarRegistrosSelecionados() {
	var idObjRetorno = document.getElementById('idObjRetorno');
	var objRetorno = parent.document.getElementById(idObjRetorno.value);
    var grid = getGrid(objRetorno);

    if(grid == null) {
    	return;
    }

    var idGrid = grid.id.substring(0,1).toLowerCase() + grid.id.substring(1);

  	//Cria um gridHandler para a grid de retorno
    var handler = new GridHandler(idGrid, parent.document);
    if(handler.size() > 0 && document.forms[0].rowSelect) {

		var gridSize = handler.size();
		//Pega os campos da linha 0
		var fields = handler.getRowFields(0);
		//Pega as properties dos campos
		var keys = fields.keys();
		var fieldsSize = fields.size();


    	var searchCount = document.forms[0].rowSelect.length;
        if (!searchCount) {
        	searchCount = 1;
        }

       	var linhaSel = document.getElementById( "linha_0" );
        var nodosRef = pegaReferencias( linhaSel );
	    var camposChave = getCamposChaveSearch(nodosRef);
		var searchKeys = camposChave.keys();
       	var searchKeysLength = searchKeys.length;

		var fnSort = function(a,b) {
			if (a.c>b.c) return 1;
			if (a.c<b.c) return -1;
			return 0;
		}

        if(searchCount < gridSize) {
        	var arrayChavesGridRetorno = new Array();
			for(var j = 0; j < gridSize; j++) {
				var idRegistroGridRetorno = "";
				for(var k = 0; k < searchKeysLength; k++ ) {
					var valorGridRetorno = handler.getFieldData(j,searchKeys[k]);
					idRegistroGridRetorno = idRegistroGridRetorno + valorGridRetorno + ";";
				}
				var reg = new Registro(idRegistroGridRetorno,j);
				arrayChavesGridRetorno.add(reg);
			}

			arrayChavesGridRetorno.sort(fnSort);

	        for( i = 0; i < searchCount; i++) {
	            var linhaSel = document.getElementById( "linha_" + i );
		        var nodosRef = pegaReferencias( linhaSel );
			    var camposChave = getCamposChaveSearch(nodosRef);
				var searchKeys = camposChave.keys();

				var idRegistroGridSearch = "";
				for(var k = 0; k < searchKeysLength; k++ ) {
					var valorGridSearch = camposChave.get(searchKeys[k]);
					idRegistroGridSearch = idRegistroGridSearch + valorGridSearch + ";";
				}

				var resultadoBusca = buscaBinaria(arrayChavesGridRetorno, idRegistroGridSearch, false);

				if(resultadoBusca != -1) {
					desabilitarLinhaSearch(linhaSel);
				}
			}
		} else {
			var arrayChavesGridSearch = new Array();
			for( i = 0; i < searchCount; i++) {
	            linhaSel = document.getElementById( "linha_" + i );
		        nodosRef = pegaReferencias( linhaSel );
			    camposChave = getCamposChaveSearch(nodosRef);

				var idRegistroGridSearch = "";
				for(var k = 0; k < searchKeysLength; k++ ) {
					var valorGridSearch = url_decode(camposChave.get(searchKeys[k]));
					idRegistroGridSearch = idRegistroGridSearch + valorGridSearch + ";";
				}
				var reg = new Registro(idRegistroGridSearch,i);
				arrayChavesGridSearch.add(reg);
			}

			arrayChavesGridSearch.sort(fnSort);

			for(var j = 0; j < gridSize; j++) {
				var idRegistroGridRetorno = "";
				for(var k = 0; k < searchKeysLength; k++ ) {
					var valorGridRetorno = handler.getFieldData(j,searchKeys[k]);
					idRegistroGridRetorno = idRegistroGridRetorno + valorGridRetorno + ";";
				}
				var resultadoBusca = buscaBinaria(arrayChavesGridSearch, idRegistroGridRetorno, false);

				if(resultadoBusca != -1) {
					var registro = arrayChavesGridSearch[resultadoBusca];
					desabilitarLinhaSearch(document.getElementById( "linha_" + registro.i ));
				}
		    }
		}
	}
}

function Registro(chave,index){
	this.c = chave;
	this.i = index;
}

function buscaBinaria(o, v, i) {
    var h = o.length, l = -1, m;
    while(h - l > 1)
        if(url_decode(o[m = h + l >> 1].c) < url_decode(v)) l = m;
        else h = m;


        var vl = o[h];
        if((vl != undefined) && (vl != "undefined")){
    		return url_decode(vl.c) != url_decode(v) ? i ? h : -1 : h;
    	}else{
    		return -1;
    	}
}

function desabilitarLinhaSearch(linhaSel) {
	linhaSel.onmouseover = '';
	linhaSel.onmouseout = '';
	linhaSel.setAttribute('disabled', 'true');
	jQuery('#'+linhaSel.id).removeAttr('style');
	jQuery('#'+linhaSel.id).addClass('corFonteDesabilitada');
	var tdsSelecionados = jQuery('#'+linhaSel.id + ' td');
	tdsSelecionados.each( function() {
		this.onclick = '';
		this.ondblclick = '';
		this.setAttribute('title','Este registro j� est� selecionado');
	});
	var checksSelecionados = jQuery('#'+linhaSel.id + ' input');
	checksSelecionados.each( function() {
		this.disabled = true;
		if(this.getAttribute('type') == 'checkbox') {
			this.checked = 'true';
		}
	});
}


function getCamposChaveSearch(tds){
	var chaves = new Hash();
	var chavesCandidatas = new Hash();
	for( j = 0; j < tds.length; j++ ) {
		var valorRetorno = SR_getValorCelulaSearch(tds[j]);
		if(ehChave(tds[j])) {
			chaves.put(getAttribute(tds[j], 'reference'),valorRetorno);
		} else {
			var property = getAttribute(tds[j], 'property');
			if(ehChaveCandidata(property)){
				chavesCandidatas.put(getAttribute(tds[j], 'reference'),valorRetorno)
			}
		}
	}
	if(chaves.size() == 0){
		chaves = chavesCandidatas;
	}

	return chaves;
}
function SPWUtil() { }


/** Popula os campos definidos em mapForm os valores de map
 *  map: map com atributo e valor
 *  mapForm: map com atributo e nome do campo
**/
SPWUtil.setValues = function(map, mapForm) {
  for (var property in map) {
      var propertyId = mapForm[property];
      if(propertyId !== null){
      	DWRUtil.setValue(propertyId, map[property]);
      }
  }
};


/** Popula os campos de uma grid definidos em mapForm os valores de map
 *  map: map com atributo e valor
 *  mapForm: map com atributo e nome do campo
 *  row: numero da linha criada
**/
SPWUtil.setValuesRow = function(map, mapForm, row) {
  for (var property in map) {
      var propertyId = mapForm[property];
      if(typeof propertyId == "string" || propertyId instanceof String) {
      	propertyId = propertyId.replace("\?", row) + "_" + row;
      	DWRUtil.setValue(propertyId, map[property]);
      }
  }
};
/**
 *
 */
function F_getBrowserHeight() {
  var test1 = document.body.clientHeight;
  var test2 = document.documentElement.clientHeight;
  if(F_haveDoctype()) {
    return test2;
  }
  else {
    return test1;
  }
}

/**
 *
 */
function F_getBrowserWidth() {
  var test1 = document.body.clientWidth;
  var test2 = document.documentElement.clientWidth;
  if(F_haveDoctype()) {
    return test2;
  }
  else {
    return test1;
  }
}

/**
 *
 */
function F_haveDoctype(){
	if(jQuery.browser.msie){
		var doctype = null;
		if (document.all[0].text)
			doctype = (document.all[0].text.indexOf('<!DOCTYPE') == 0);

		if (doctype == false || doctype == null) {
			var metaTag = jQuery('meta[http-equiv=X-UA-Compatible]');
			if (metaTag.length != 0) {
				return true;
			}
		}
		if(doctype){
			return true;
		}else{
			return false;
		}
	}else{
		if(document.doctype){
			return true;
		}else{
			return false;
		}
	}
}


/**
 * Retorna TRUE se o browser for Internet Explorer.
 */
function F_isIExplorer() {
    return (navigator.appName != "Netscape");
}

/** Pega o valor de um atributo do objeto **/
function getAttribute(obj, attrName) {
	if(obj == null) return null;
	if(obj.attributes) return obj.getAttribute(attrName);
	return null;
}

function getTBody(obj) {
  if(obj != null){
	  nTBody = obj.childNodes.length;
	  for (iTBody = 0; iTBody < nTBody; iTBody++) {
	      if (obj.childNodes[iTBody].nodeName == 'TBODY') {
	         return obj.childNodes[iTBody];
	      }
	  }
  }
  return null;
}

function isTextNode(node) {
  return (node.nodeName == '#text');
}

function F_openPage(url){
	//contexto absoluto
	if(url.indexOf("/") == 0 || url.indexOf("http://") == 0){
		document.location.href = url
		return
	}

	//verifica se existe a tag "base"
	arrayBase = document.getElementsByTagName("BASE")
	if(arrayBase == null || arrayBase[0] == null){
		document.location.href = url
	}else{
		objBase = arrayBase[0]
		hrefBase = new String(objBase.href)
		posBarra = hrefBase.lastIndexOf("/")
		hrefBase = hrefBase.substring(0, posBarra + 1)
		document.location.href = hrefBase + url
	}
}

function F_getElementByNameOrId(doc,nameOrId){
	var obj = doc.getElementById(nameOrId);
	if(obj == null){
		var objs = doc.getElementsByName(nameOrId);
		if((objs==null)||(objs.childNodes)){
			return null;
		}
		return jQuery(objs).filter('input:first').get(0);
	}
	return obj;
}
function F_strPad(string,size,fill) {
	if (!fill) { fill = '0'; }
	while (string.length < size) {
		string += fill;
	}
	return string;
};
/** Retorna < 0 se a "data1" for menor que a "data2".
    Retorna == 0 se a "data1" for igual a "data2".
    Retorna > 0 se a "data2 for maior que a "data2" **/
function comparaData(data1, data2) {

    dataSplit1 = data1.split("/");
    dateObj1 = new Date(dataSplit1[2], Number(dataSplit1[1])-1, dataSplit1[0]);

    dataSplit2 = data2.split("/");
    dateObj2 = new Date(dataSplit2[2], Number(dataSplit2[1])-1, dataSplit2[0]);

    return dateObj1.getTime() - dateObj2.getTime();

}
/**
 * Procura o pr�ximo campo da tela e d� o foco para ele.
 */
function FF_GetProxCtrl(ctrlAtual) {
	if (jQuery.browser.msie) {
		nProxCtrl = ctrlAtual.sourceIndex+1;
		proxCtrl = document.all[nProxCtrl];
		while (proxCtrl != null) {
			if (proxCtrl.nodeName == "INPUT") {
				return proxCtrl;
			}
			nProxCtrl++;
			proxCtrl = document.all[nProxCtrl];
		}
	} else {
		var elements = ctrlAtual.form.elements;
		var length = elements.length;
		for (nProxCtrl=0; nProxCtrl < length; nProxCtrl++) {
			if (ctrlAtual == elements[nProxCtrl] &&	(nProxCtrl+1) <= length) {
				return elements[nProxCtrl+1];
			}
		}
	}
	return null;
}

/**
 * Procura o pr�ximo campo da tela e d� o foco para ele.
 */
function FF_GetForm(ctr) {
	while (ctr != null && ctr.tagName != "FORM") {
		ctr = ctr.parentNode;
	}
	return ctr;
}

/**
 * Varre o formul�rio, e desabilita todos os inputs, checkboxes, textareas, combos,
 * e radios acrescentando tamb�m o estilo "d" (desabilitado) ao campo quando poss�vel.
 * Tamb�m esconde bot�es de grids.
 * Caso haja necessidade de algum controle espec�fico ficar habilitado ou vis�vel
 * crie um atributo no controle alwaysEnabled="true" ou alwaysVisible="true".
 */
function FF_desabilitaForm(objForm) {
	var length = objForm.length;
	for (var i = 0; i < length; i++) {
		var obj = objForm[i];
		var alwaysVisible = false;
		var alwaysEnabled = false;
		var objAlwaysVisible = obj.getAttribute('alwaysVisible');
		var objAlwaysEnabled = obj.getAttribute('alwaysEnabled');
		var objType = obj.type;
		var objReadOnly = obj.readOnly;
		var objNodeName = obj.nodeName;
		var objClassName = obj.className;
		var objDisabled = obj.disabled;

		if (objAlwaysVisible != null)
			alwaysVisible = new String(objAlwaysVisible).toUpperCase() == "TRUE";
		if (objAlwaysEnabled != null)
			alwaysEnabled = new String(objAlwaysEnabled).toUpperCase() == "TRUE";
		if (objNodeName == "INPUT" && objType == "text" && !obj.readOnly && !alwaysEnabled) {
			disable(obj);
		} else if (objNodeName == "INPUT" && objType == "checkbox" && !objDisabled && !alwaysEnabled) {
			obj.disabled = true;
		} else if (objNodeName == "TEXTAREA" && !objReadOnly && !alwaysEnabled) {
			disable(obj);
		} else if (objNodeName == "SELECT" && !objDisabled && !alwaysEnabled) {
			disable(obj);
			obj.disabled = true;
		} else if (objNodeName == "INPUT" && objType == "button" && objClassName == "spwBotaoGrid" && !alwaysVisible) {
			obj.style.visibility = "hidden";
		} else if (objNodeName == "INPUT" && objType == "radio") {
			obj.disabled = true;
		}
	}
}

function FF_desabilitaBotoes(objForm) {
	var length = objForm.length;
	for (var i = 0; i < length; i++) {
		var obj = objForm[i];
		B_desabilitaBotao(obj);
	}
}

function FF_habilitaBotoes(objForm) {
	var length = objForm.length;
	for (var i = 0; i < length; i++) {
		if (objForm[i].nodeName == "INPUT" && (objForm[i].type == "button" || objForm[i].type=="submit")) {
			objForm[i].disabled = false;
			if(objForm[i].getAttribute('oldClassName') != null){
				objForm[i].className = objForm[i].getAttribute('oldClassName');
			}
		}
	}
}

function FF_desabilitaGridListPaginada(objForm){
	var length = objForm.length;
	for (var i = 0; i < length; i++) {
		var obj = objForm[i];
		if(new String(obj.getAttribute('desabilitaOnSubmit')).toUpperCase() == "TRUE"){
			obj.disabled = true;
		}
	}
}
/** Faz um trim em uma determinada string **/
function trim(str) {
	if(str != null){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	}else{
		return null;
	}
}

function replaceAll(str,token1, token2){
	while(str.indexOf(token1) != -1){
		str = str.replace(token1, token2);
	}
	return str;
}


function parseStrToFloat(str){
    if(isNaN(parseFloat(str.replace(/\./g,"").replace(/\,/g,".")))){
        return parseFloat(0.0);
    } else {
        return parseFloat(str.replace(/\./g,"").replace(/\,/g,"."));
    }
}

function parseFloatToStr(num,casas){
    if(isNaN(num)){
        return CN_getValorFormatado("-$."+casas,"0");
    } else {
        num = num.toFixed(casas);
        return CN_getValorFormatado("-$."+casas,num.toString().replace(/\./g,","));
    }
}

function FS_startsWith(str, begin){
	return str.indexOf(begin) == 0;
}

function FS_endsWith(str, end){
	if(str == end){
		return true;
	}
	if(end.length >= str.length){
		return false;
	}
	var last = str.substring(str.length - end.length );
	return (last == end);
}
/** Aplica um XSL a um XML e retorna o texto da transforma��o **/
function aplicaXSL(localXML, localXSL) {

    // Carrega o XML
    var xml = new ActiveXObject("Microsoft.XMLDOM");
    xml.async = false;
    xml.load(localXML);

    // Carrega o XSL
    var xsl = new ActiveXObject("Microsoft.XMLDOM");
    xsl.async = false;
    xsl.load(localXSL);

    // Retorna o documento transformado
    return xml.transformNode(xsl);

}

/** Troca os caracteres especias do HTML pelas TAGS correspondentes **/
function ajustaConteudoHTML(conteudo) {

    //Troca os caracteres "<" e ">" de html para ASC e escreve o documento
    splitTexto = conteudo.split(String.fromCharCode(13));
    conteudoAjustado = "";
    for (i=0;i<splitTexto.length;i++) {
        splitTexto[i] = splitTexto[i].replace(/&LT;/gi,"<");
        splitTexto[i] = splitTexto[i].replace(/&GT;/gi,">");
        conteudoAjustado = conteudoAjustado + splitTexto[i];
    }
    return conteudoAjustado;

}

corExcluir = "#FFAEAE";
corSelecionada = "#FFFFCC";
corAntiga = "";
corDesabilitada = "#EBEBEB";

/** Retorna o diretorio da imagem **/
function getFolder(obj) {
	srcObj = new String(obj.src);
	posBarra = srcObj.lastIndexOf("/");
	return srcObj.substr(0, posBarra);
}

/** Retorna o ultimo filho da cadeia do obj **/
function getLastDesc(obj){
	last = obj.lastChild;
	while (last != null && last.lastChild != null) {
		last = last.lastChild;
	}
	return last;
}

/** Retorna o proximo node **/
function nextNode(node){
	currentNode = node;
	if (currentNode.hasChildNodes()) {
		return currentNode.childNodes[0];
	} else {
		if (currentNode.nextSibling == null) {
			pai = currentNode.parentNode;
			while (pai.nextSibling == null) {
				pai = pai.parentNode;
			}
			return pai.nextSibling;
		} else {
			return currentNode.nextSibling;
		}
	}
}

/** Seta a largura da borda do componente **/
function setLarguraBorda(obj, largura){
	obj.style.borderBottomWidth = largura;
	obj.style.borderTopWidth = largura;
	obj.style.borderLeftWidth = largura;
	obj.style.borderRightWidth = largura;
}

/** Retorna o nome do grid**/
function getNomeGrid(grid){
    return getAttribute(grid, 'nmGrid');
}

/** Retorna o tipo da grid**/
function getTipoGrid(grid){
    return getAttribute(grid, 'tipoGrid');
}

/** Retorna o objeto da grid, passando como parametro qualquer objeto dentro da grid **/
function getGrid(obj){
	while (obj != null && getNomeGrid(obj) == null) {
		obj = obj.parentNode;
	}
	return obj;
}

/** Retorna TRUE se a grid for indexada **/
function gridIsIndexed(grid) {
    return (getAttribute(grid, 'indexed') == "true");
}

/** Retorna TRUE se a grid utilizar um MAP **/
function gridIsMapped(grid) {
    return (getAttribute(grid, 'mapped') == "true");
}

/** Retorna TRUE se for multiselecaoo **/
function gridIsMultiselection(grid){
    return (getAttribute(grid, 'multiselection') == "true");
}

function isLinhaGrid(obj) {
    return (getAttribute(obj, 'linha') == "true");
}

/** Funcao para retornar a linha da grid **/
function getLineGrid(obj){
	//procura pelos parents do obj ate achar um que tenha atributo linha=true
	linhaSel = obj;
	while (!isLinhaGrid(linhaSel)) {
		if (linhaSel.nodeName == "BODY") {
			return null;
		}
		linhaSel = linhaSel.parentNode;
	}
	return linhaSel;
}

/** Funcao para retornar o texto antes do _ **/
function getFieldName(idNode){
  	idNode = new String(idNode);
  	posTraco = idNode.lastIndexOf("_");
    if (posTraco < 0) {
        return idNode;
    } else {
    	if(FS_endsWith(idNode,"_inputCheckBox")) {
    		idNode = idNode.substring(0, idNode.indexOf("_inputCheckBox"));
    	}
    	var indice = parseInt(getFieldIndex(idNode));
    	if(isNaN(indice)) {
	    	return idNode;
	    } else {
	      	return idNode.substr(0, posTraco);
	    }
    }
}

/** Funcao para retornar o texto depois do _ **/
function getFieldIndex(idNode){
   	idNode = new String(idNode);
    posTraco = idNode.lastIndexOf("_");
  	return idNode.substr(posTraco + 1);
}

/** Funcao para pegar o nome da grid como profixo dos campos **/
function getPrefixColGridName(pGrid) {
    nm = new String(getNomeGrid(pGrid));
    if (nm.length < 2) {
        return nm.toLowerCase();
    } else {
        return nm.substr(0,1).toLowerCase() + nm.substr(1);
    }
}

/** Funcao para retornar o ID do campo **/
function getColumnId(obj, colname, index) {
    var grid = getGrid(obj);
    gridname = getPrefixColGridName(grid);
    id = "";
    if (gridIsIndexed(grid)) {
        id=id+gridname+"["+index+"].";
    }
    if (gridIsMapped(grid)) {
        id=id+"value("+colname+")";
    } else {
        id=id+colname;
    }
    return id+"_"+index;
}

/** Funcao para retornar o ID do campo **/
function getColumnIdIndexed(gridname, colname, index) {
	return gridname.substring(0,1).toLowerCase()+gridname.substring(1)+"["+index+"]."+colname+"_"+index;
//  	if (jQuery.browser.msie) {
//  		return gridname+"["+index+"]."+colname+"_"+index;
//  	}else{
//  		return gridname.substring(0,1).toLowerCase()+gridname.substring(1)+"["+index+"]."+colname+"_"+index;
//  	}
}

/** Funcao para retornar o nome do novo campo criado **/
function getNewFieldName(obj, fieldname, index){
    var grid = getGrid(obj);
    gridname = getPrefixColGridName(grid);
    id = getFieldName(fieldname);
	if(grid.getAttribute("paginada") == "true"){
		posPonto = id.lastIndexOf(".");
		id = gridname+"["+index+"]."+id.substring(posPonto+1);
	}else if (gridIsIndexed(grid)) {
		posPonto = id.indexOf(".");
		id = gridname+"["+index+"]."+id.substring(posPonto+1);
   	}
    return id+"_"+index;
}

/** Funcao para retorna apenas o nome do campo,
    como se no fosse "mapped" e "indexed"  **/
function getInternalColName(obj, colname) {
    var grid = getGrid(obj);
    if (gridIsIndexed(grid)) {
        colname = colname.substr(colname.indexOf(".")+1);
    }
    if (gridIsMapped(grid)) {
        lenValue = new String("value(").length;
        colname = colname.substr(lenValue, colname.length-lenValue-1);
    }
    return colname;
}

/** Funcao para pegar o nro de linha na grid **/
function getNuLinhas(doc, gridname) {
	textQtLinhas = doc.querySelector('[id^="textQtLinhas"]').childNodes[0];
	return new Number(textQtLinhas.nodeValue);
}

/** Funcao para escurecer uma cor **/
function escurecerCor(cor) {
	fatorEsc = 2;
	if(cor == "") {
		return "";
    } else {
    	caracHex = "0123456789ABCDEF";
        novaCor = "#";
    	for (i = 1; i < cor.length; i++) {
        	posCarac = caracHex.indexOf(cor.substr(i,1).toUpperCase());
            if (posCarac - fatorEsc < 0) {
    			novaCor += "0";
        	} else {
    			novaCor += caracHex.substr(posCarac - fatorEsc, 1);
        	}
    	}
    }
	return novaCor;
}

//muda a cor de todos os objetos text dentro da hierarquia do "obj"
function mudarCorLinha(obj, nmEvento){
    var ehBotaoDel = (obj.className == "spwImagemExcluirGrid" || nmEvento == 'del');
	var ehNovaLinha = (nmEvento == "new");
    var linhaSel = getLineGrid(obj);
    var cor;
    if (ehNovaLinha) {
		cor = corAntiga;
	} else if (ehBotaoDel) {
        var grid = getGrid(obj);
        var index = getFieldIndex(obj.id);
        var idAcao = getColumnId(grid, "status", index);
        var acaoLinha = document.getElementById(idAcao);
        if (new String(acaoLinha.value).charAt(0) == 'D') {
            cor = corExcluir;
        } else {
            cor = corAntiga;
        }
    } else {
    	if (nmEvento == "focus") {
            cor = corSelecionada;
        } else {
        	var grid = getGrid(obj);
	        var index = getFieldIndex(obj.id);
	        var idAcao = getColumnId(grid, "status", index);
	        var acaoLinha = document.getElementById(idAcao);
            if (new String(acaoLinha.value).charAt(0) == 'D') {
	            cor = corExcluir;
	        } else {
	            cor = corAntiga;
	        }
        }
    }
    linhaSel.style.backgroundColor = cor;
    //Varre todas os campos da linha mudando a cor
    var lastDesc = getLastDesc(linhaSel);
    var currentNode = linhaSel;
	if (lastDesc != null && currentNode != null) {
		do {
			currentNode = nextNode(currentNode);
			if (currentNode.nodeName == "TD" ||
						currentNode.tagName == "INPUT" ||
						currentNode.tagName == "SELECT" ||
						currentNode.tagName == "TEXTAREA") {
				if (currentNode.readOnly == true || currentNode.className.indexOf("disabled") != -1) {
					if (cor == corSelecionada) {
						currentNode.style.backgroundColor = escurecerCor(cor);
					} else if (cor == corExcluir) {
						currentNode.style.backgroundColor = corExcluir;
					} else {
						currentNode.style.backgroundColor = corDesabilitada;
					}
				} else {
					currentNode.style.backgroundColor = cor;
				}
			}
		} while (lastDesc != currentNode);
	}
    //Muda o fundo do objeto selecionado
    if (!ehBotaoDel && obj.style.backgroundColor.toUpperCase() != corExcluir && nmEvento != 'blur') {
        obj.style.backgroundColor = "#FFFFFF";
    }
}

/** Copia a linha e percorre todos os seus filhos para alterar seus atributos **/
function novaLinha(obj, index, nmGrid, linhaVisivel){
    //Faz o clone do objeto "obj"
    var objNovo = obj.cloneNode(true);
    objNovo.id = "linha"+nmGrid+"_"+index;
    if(linhaVisivel == false){
	    objNovo.style.display = "none";
    }else{
    	objNovo.style.display = "";
    }

	var grid = getGrid(obj);
    configuraInputs(grid,index,objNovo.getElementsByTagName('INPUT'));
    configuraImg(grid,index,objNovo.getElementsByTagName('IMG'));
    configuraSelects(grid,index,objNovo.getElementsByTagName('SELECT'));
    configuraDiv(grid,index,objNovo.getElementsByTagName('DIV'));
    configuraTextArea(grid,index,objNovo.getElementsByTagName('TEXTAREA'));
	return objNovo;
}

function configuraInputs(grid,index,componentes){
	for(var i = 0; i < componentes.length; i++) {
		var componente = componentes[i];
		if(grid.getAttribute("paginada") == "true"){
			componente.setAttribute("readonly","true");
		}
		if((componente.type == "text" || componente.type == "hidden") && !(componente.getAttribute('inputcheckbox') == "true")){
			componente.value = "";
		}
		configuraComponente(grid,index,componente);
		if (componente.id == getColumnId(grid, "status", index)) {
			componente.value = "I";
		}
	}
}


function configuraSelects(grid, index, componentes){
	for(var i = 0; i < componentes.length; i++) {
		var componente = componentes[i];
		if(grid.getAttribute("paginada") == "true"){
			componente.setAttribute("disabled",true);
		}
		configuraComponente(grid,index,componente);
	}
}

function configuraDiv(grid, index, componentes){
	for(var i = 0; i < componentes.length; i++) {
		var componente = componentes[i];
		configuraComponente(grid,index,componente);
	}
}

function configuraTextArea(grid, index, componentes){
	for(var i = 0; i < componentes.length; i++) {
		var componente = componentes[i];
		configuraComponente(grid,index,componente);
		componente.value = "";
	}
}

function configuraImg(grid, index, componentes){
	for(var i = 0; i < componentes.length; i++) {
		var componente = componentes[i];
		configuraComponente(grid,index,componente);
		var nmGrid = getNomeGrid(grid);
		if (componente.id == getColumnId(grid, "estado"+nmGrid, index)) {
			componente.src = getFolder(componente) + "/estadoI.gif";
			componente.title = "Novo";
		}
		if ( componente.className == "spwImagemExcluirGrid" ) {
			componente.valor = "";
			var srcNode = new String(componente.src);
			var posBarra = srcNode.lastIndexOf("/");
			componente.src = srcNode.substr(0, posBarra) + "/" + "botExcluirGrid.gif";
			if(new String(componente.getAttribute("disableOnCreate")).toUpperCase() == "TRUE"){
				componente.onclick = null;
				componente.onmouseover = null;
				componente.onmouseout = null;
				IMG_enable(componente,false);
			}
		}
		if ( componente.className == "spwImagemEditarGrid" ) {
			if(new String(componente.getAttribute("disableOnCreate")).toUpperCase() == "TRUE"){
				componente.onclick = null;
				componente.onmouseover = null;
				componente.onmouseout = null;
				IMG_enable(componente,false);
			}
		}
	}
}

function configuraComponente(grid,index,componente){
	var nmNode = componente.id;
	if(jQuery.trim(nmNode) == "" || nmNode == null){
		nmNode = componente.getAttribute("name");
		if(jQuery.trim(nmNode) == "" || nmNode == null){
			nmNode = componente.getAttribute('property')
		}
	}
	var newId = getNewFieldName(grid,nmNode,index);
	componente.id = newId;
	var $componente = $(componente);

	if(!isGridCheckbox(grid)){
		componente.name = getFieldName(newId);
	} else {
		var nameComponente = $componente.attr('name');
		$componente.attr('name_', nameComponente);
		$componente.attr('submit', true);

		$componente.removeAttr('name');
		$componente.removeAttr('readonly');
	}

	if (new String(componente.id).substr(0, 8) == "spwCheck" ) {
		componente.value = "false";
	}
}

/** Verifica se a grid é uma grid checkbox */
function isGridCheckbox(grid){
	return $(grid).find('input[type=checkbox]').length > 0 && $(grid).html().indexOf('GridPaginadaCheckbox') > -1;
}

/** Cria uma linha da grid **/
function criarLinha(obj, canfocus, linhaVisivel){
    return criarNovaLinha(obj, canfocus,linhaVisivel);
}

/** Cria uma linha da grid **/
function criarNovaLinha(obj, canfocus, linhaVisivel){
	var grid = getGrid(obj);

	nmGrid = getNomeGrid(grid);
	if(nmGrid === null){
		nmGrid = "Row";
	}
	nuLinha = getNuLinhas(document, nmGrid);

	//pega a tabela principal que contem a linha a ser duplicada
	TBprincipal = document.getElementById(nmGrid).lastChild;
	
	
	TRprincipal = document.getElementById("linha"+nmGrid+"_-1");
    TRWidthBase = document.getElementById("trWidthBase"+nmGrid);

	//copia a linha
	TRcopia = novaLinha(TRprincipal, nuLinha, nmGrid,linhaVisivel);

	//TBprincipal.appendChild(TRcopia);
    TBprincipal.insertBefore(TRcopia, TRWidthBase);
    //mudarCorLinha(TRcopia, "new");

	//coloca o foco
	if(canfocus){
        fieldFocus = getAttribute(obj, "fieldFocus");
        if (fieldFocus != null) {
            objFocus = document.getElementById(getNewFieldName(obj, fieldFocus, nuLinha));
            if (objFocus != null && !objFocus.readOnly && !objFocus.disabled && objFocus.offsetHeight != 0) {
                objFocus.focus();
                mudarCorLinha(objFocus, "focus");
            }
        }
	}

    //Seta o numero de linhas da grid
	textQtLinhas.nodeValue = nuLinha+1;
	depoisCriarLinha(grid, TRcopia);
	return TRcopia;
}

/**
 * Este m�todo pode ser sobrescrito para adicionar um comportamento ao final
 * da cria��o da linha.
 */
function depoisCriarLinha(grid, novaLinha) {
}

function changeAction(obj, acao) {
    var grid = getGrid(obj);
    index = getFieldIndex(obj.id);
    changeActionGrid(grid, index, acao);
}

/** Coloca o "name" em  todos campos da linha do obj baseado nos seus id's **/
function changeActionGrid(grid, index, acao) {
    nmGrid = getNomeGrid(grid);
	idAcao = getColumnId(grid, "status", index);
	acaoLinha = document.getElementById(idAcao);
    acaoOld = acaoLinha.value;

	idEstado = getColumnId(grid, "estado"+nmGrid, index);
	estadoLinha = document.getElementById(idEstado);
	dirEstado = getFolder(estadoLinha);
	var hintEstado = "";
    if (acao == "U" && acaoOld == "I") {
        acao = "I";
    } else if ((acao == "D" && acaoOld == "U") ||
               (acao == "U" && (acaoOld == "DU" || acaoOld == "D"))) {
        acao = "DU";
        hintEstado = "Excluido";
    } else if (acao == "D" && acaoOld == "D") {
        acao = "";
    } else if (acao == "D" && acaoOld == "DU") {
        acao = "U";
    } else if ((acao == "D" && acaoOld == "I") ||
               (acao == "U" && acaoOld == "DI")) {
        acao = "DI";
        hintEstado = "Excluido";
    } else if (acao == "D" && acaoOld == "DI") {
        acao = "I";
	}
	if(acao == "U"){
		hintEstado = "Alterado";
	}else if (acao == "D"){
		hintEstado = "Excluido";
	}else if (acao == "I"){
		hintEstado = "Novo";
	}
    estadoLinha.src = dirEstado + "/estado" + acao + ".gif";
    estadoLinha.title = hintEstado;
	acaoLinha.value = acao;

	//percorre todo os objetos da linha, alterando o "name" deles
	linhaSel = getLineGrid(estadoLinha);
    lastDesc = getLastDesc(linhaSel);
    currentNode = linhaSel;
	if (lastDesc != null && currentNode != null) {
		do {
			currentNode = nextNode(currentNode);
			//verifica se o node corrente  um input e troca seus atributos
			if (currentNode.nodeName == "INPUT" ||
					currentNode.nodeName == "SELECT" ||
					currentNode.nodeName == "TEXTAREA") {
				if (acao == "") {
					if (!(currentNode.getAttribute('readonly') === "readonly")) {
						currentNode.readOnly = false;
					}
				} else if (acao == "D") {
					if (currentNode.readOnly === false) {
						currentNode.readOnly = true;
					}
				}
				if ((acao == "" || acao == "DI") && (grid.getAttribute('postAllRows') != "true")) {
					currentNode.name = "";
				} else {
					currentNode.name = getFieldName(currentNode.id);
				}
			}
		} while (lastDesc != currentNode);
	}
}

/** Implementado para melhorar performance da grid associative
	N�o altera o name dos componentes. Espera que o name j� esteja setado.
**/
function changeActionGridInsert(grid, index) {
    var nmGrid = getNomeGrid(grid);
	var idAcao = getColumnId(grid, "status", index);
	var acaoLinha = document.getElementById(idAcao);
    var acaoOld = acaoLinha.value;

	var idEstado = getColumnId(grid, "estado"+nmGrid, index);
	var estadoLinha = document.getElementById(idEstado);
	var dirEstado = getFolder(estadoLinha);

    estadoLinha.src = dirEstado + "/estadoI.gif";
    estadoLinha.title = "Novo";
	acaoLinha.value = "I";
}

function excluirRegistro(link) {
    if (confirm(msgKey("label.js.confirmeExclusao"),"")) {
        window.location.href = link;
    }
}

function focoNoObjId(id) {
    obj = document.getElementById(id);
    obj.focus();
}


/** Verifica se os dados da grid foram modificados **/
function dadosModificados(doc, gridname) {
    nuLinhas = getNuLinhas(doc, gridname);
    modificou = false;
    for (i = 0; i < nuLinhas; i++) {
        modificou = modificou ||
            !((doc.getElementById(getColumnIdIndexed(gridname,'status',i)).value == "") ||
            (doc.getElementById(getColumnIdIndexed(gridname,'status',i)).value == "DI"));
    }
    return modificou;
}

/** Verifica se a grid possui alguma linha que nao esta excluda **/
function possuiAlgumaLinhaNaoExcluida(doc, gridname) {
    nuLinhas = getNuLinhas(doc, gridname);
    for (i = 0; i < nuLinhas; i++) {
        if ((doc.getElementById(getColumnIdIndexed(gridname,'status',i)).value.indexOf("D") == -1)) {
            return true;
        }
    }
    return false;
}

/** Verifica se existem linhas com cdigo duplicado na grid.
    Os campos podem ser separados por ponto e virgula. **/
function validaCamposDuplicadosGrid(gridname, campos) {
    nuLinhas = getNuLinhas(document, gridname);
    chaves = "";
    sep = "%";
    arCamposChave = campos.split(";");
    //alert(campos + " - " + arCamposChave);
    for (iLinhaGrid = 0; iLinhaGrid < nuLinhas; iLinhaGrid++) {
    	//Se tiver com estados DI no deve considerar a validao
    	//pois a linha no ser aplicada pois o registro est cancelado
    	if (document.getElementById(getColumnIdIndexed(gridname,'status',iLinhaGrid)).value != "DI") {
	    	valorAtual = "";
    		for (iCamposChave = 0; iCamposChave < arCamposChave.length; iCamposChave++) {
    			//alert(grid+"["+iLinhaGrid+"]."+arCamposChave[iCamposChave]+"_"+iLinhaGrid);
        		valorAtual = valorAtual + document.getElementById(getColumnIdIndexed(gridname,arCamposChave[iCamposChave],iLinhaGrid)).value + ";";
	    	}
    		valorAtual = sep + valorAtual + sep;
  			//alert(valorAtual + " - " + chaves);
	    	//--
    	    if (chaves.indexOf(valorAtual) != -1) {
        		return false;
	        } else {
		    	chaves = chaves + valorAtual;
        	}
    	}
    }
    return true;
}

/** Verifica se existem linhas com codigo duplicado na grid do parent.
    Os campos podem ser separados por ponto e virgula. **/
function isCamposDuplicadosGridParent(gridname, campos, registroSelecionado) {
    var nuLinhas = getNuLinhas(parent.document, gridname);
    var valorAtual = "";
    var campoAtual = null;
    var arCamposChave = campos.split(";");
    var countExiste = 0;

    for (iLinhaGrid = 0; iLinhaGrid < nuLinhas; iLinhaGrid++) {
    	if (parent.document.getElementById(getColumnIdIndexed(gridname,'status',iLinhaGrid)).value != "DI") {
	    	valorAtual = "";
	    	countExiste = 0;
	    	var camposChaveSize = arCamposChave.length;

    		for (iCamposChave = 0; iCamposChave < camposChaveSize; iCamposChave++) {

     			var valoresSelecionados = getValoresSelecionados(registroSelecionado);
     			var pageReference = pageReferences[j];

     			for( j = 0; j < valoresSelecionados.length; j++ ) {
     	   			var inputId;
	        		if(pageReference == null || pageReference == "false"){
						inputId = parent.nomeCampoEquivalenteGrid(idObjRetorno, references[j]);
					} else {
						inputId = references[j];
					}

	        		campoAtual = parent.document.getElementById(getColumnIdIndexed(gridname,inputId,iLinhaGrid));
					if(campoAtual != null && campoAtual != ""){
		        		valorAtual = campoAtual.value;

	     	   			if( inputId != null && (arCamposChave[iCamposChave] == inputId)) {
	      	   				var valor = url_decode(valoresSelecionados[j]);
	       					if(valor == valorAtual){
	       						countExiste++;
	       					}
	      				}
					}
      			}
       		}

	    	if(countExiste == camposChaveSize){
       			return true;
       		}
    	}
    }
    return false;
}

/** Marca todos os campos no grid **/
function selecionaTodosNaGrid(ctrl, inputName, checked) {
    var grid = getGrid(ctrl);
    nuLinhas = getNuLinhas(document, getNomeGrid(grid));
    for (iFld30734=0; iFld30734 < nuLinhas; iFld30734++) {
        colid = getColumnId(grid, inputName, iFld30734);
        col = document.getElementById(colid);
        if (col.nodeName.toUpperCase() == "INPUT") {
            if (col.type.toUpperCase() == "CHECKBOX") {
                col.checked = checked;
            } else {
                col.value = checked;
            }
        }
        changeActionGrid(grid, iFld30734, "U");
    }
}

function scrollHoriz(obj, idCab){
	var divCab = document.getElementById(idCab)
	divCab.scrollLeft = obj.scrollLeft
}
    /**
     * Fun��o respons�vel por marcar ou desmarcar todos os checkboxes de uma lista.
     * @param status Se param for true marca, sen�o desmarca.
     */
    function marcarChecks( status, type ) {
        var checkboxes = document.getElementsByTagName("input");
        var textareas = document.getElementsByTagName("textarea");
        var i = 1;
        for (var a = 0; a < checkboxes.length; a++) {
            if (checkboxes[a].type == "checkbox") {
                if (checkboxes[a].id != 'row[-1].membro_-1') {
                    checkboxes[a].checked = status;
                    if (textareas[i].value == 'true') {
                        changeAction(checkboxes[a], status == true ? "" : ( type == 'PU' ? "U" : "D" ));
                    }
                    else {
                        changeAction(checkboxes[a], status == true ? ( type == 'PU' ? "U" : "I" ) : "");
                    }
                    i++;
                }
            }
        }
    }

    function check( obj, type ) {
        var textareas = document.getElementsByTagName("textarea");
        for (var p = 0; p < textareas.length; p++) {
            if (textareas[p].id == obj.id) {
                if (obj.checked == true) {
                    if (textareas[p].value == 'true') {
                        changeAction(obj,"");
                    }
                    else {
                        changeAction(obj, type == 'PU' ? "U" : "I");
                    }
                }
                else {
                    if(textareas[p].value == 'true'){
                        changeAction(obj, type == 'PU' ? "U" : "D");
                    }
                    else {
                        changeAction(obj,"");
                    }
                }
                break;
            }
        }
    }
    function newLine(obj){
	var nmGrid = getNomeGrid(obj);
	var lineGridNew = criarLinha(obj);
	selectLine(lineGridNew)
	eval("document.line" + nmGrid + "Sel = lineGridNew");
	var obj2 = obj;
	openFolder(obj2, "detalhes");
}

/** **/
function openFolder(obj, tipo){

	//pega os objetos da grid
	var grid = getGrid(obj);
	var nmGrid = getNomeGrid(grid);
	var cabecalho = document.getElementById("cabecalho" + nmGrid);
	var cabecalho2 = document.getElementById("cabecalho2" + nmGrid);
	var tabela = document.getElementById("tabela" + nmGrid);
	var formulario = document.getElementById("form" + nmGrid);
	var pasta1 = document.getElementById("pasta" + nmGrid + "_1");
	var nmImagem1 = new String(pasta1.src);
	var pasta2 = document.getElementById("pasta" + nmGrid + "_2");
	var nmImagem2 = new String(pasta2.src);

	if(tipo == "detalhes"){

		//troca a imagem das pastas
		pasta1.className = "bH";
		var posBarra1 = nmImagem1.lastIndexOf("/");
		pasta1.src = nmImagem1.substr(0, posBarra1) + "/abaTabelaDes.gif";
		pasta2.className = "";
		var posBarra2 = nmImagem2.lastIndexOf("/");
		pasta2.src = nmImagem2.substr(0, posBarra2) + "/abaDetalhes.gif";

		// esconde e mostra
		cabecalho.style.display = "none";
		cabecalho2.style.display = "";
		tabela.style.display = "none";
		formulario.style.display = "";

		//pega a linha clicada ou a corrente

		if(getLineGrid(obj) == null){
			var linhaSel = eval("document.line" + nmGrid + "Sel");
		}
		else{
			var linhaSel = getLineGrid(obj);
			selectLine(obj);
			eval("document.line" + nmGrid + "Sel = linhaSel");
		}

		//popula o form
		var nuLinha = getFieldIndex(linhaSel.id);
		var cabForm = formulario.lastChild;

		var tamanhoChildNodes = linhaSel.childNodes.length;

		for(var i = 0; i < linhaSel.childNodes.length ; i++){
			var texto = linhaSel.childNodes[i].childNodes[0].nodeValue;
			if(texto != null){
				var campoForm = cabForm.childNodes[i].childNodes[1].childNodes[0];
				campoForm.value = texto;
				campoForm.id = "campo_" + nuLinha;
			}
		}


	}
	if(tipo == "tabela"){

		//troca a imagem das pastas
		pasta1.className = "";
		posBarra1 = nmImagem1.lastIndexOf("/");
		pasta1.src = nmImagem1.substr(0, posBarra1) + "/abaTabela.gif";
		pasta2.className = "spwImagemAceso";
		posBarra2 = nmImagem2.lastIndexOf("/");
		pasta2.src = nmImagem2.substr(0, posBarra2) + "/abaDetalhesDes.gif";

		//some e aparece
		cabecalho.style.display = "";
		cabecalho2.style.display = "none";
		tabela.style.display = "";
		formulario.style.display = "none";

		//
		var cabForm = formulario.lastChild;
		var linhaSel = eval("document.line" + nmGrid + "Sel");

		var cabFormChildTamanho = cabForm.childNodes.length;

		for(var i = 0; i < cabFormChildTamanho; i++){
			var texto = cabForm.childNodes[i].childNodes[1].childNodes[0].value;
			if(texto != null){;
				//alert(linhaSel.childNodes[i].childNodes[0].nodeName)
				linhaSel.childNodes[i].childNodes[0].nodeValue = texto;
			}
		}

	}

}

/** **/
function startGridEdit(nmGrid){
	var linha1 = document.getElementById("linha" + nmGrid + "_1");
	eval("document.line" + nmGrid + "Sel = linha1");
	mudarCorCampo(linha1, corSelecionada, "");
}


/** Seleciona a linha **/
function selectLine(obj){
	var objLinha = getLineGrid(obj);
	var idLinha = new String(objLinha.id);
	var nmGrid = idLinha.substr(5);
	var posTraco = nmGrid.indexOf("_");
	var nmGrid = nmGrid.substr(0, posTraco);

	mudarCorCampo(eval("document.line" + nmGrid + "Sel"), "", "");
	mudarCorCampo(objLinha, corSelecionada, "");

	eval("document.line" + nmGrid + "Sel = objLinha");

}

function upperFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Armazena o indice do registro editado no GF. � utilizado para atualizar apenas a cor da linha necess�ria.
var indexRegistroOld_GF = null;

var isGFChangeValues;
function GF_abrirGridForm(idGrid) {
	idGrid = upperFirstLetter(String(idGrid));//transforma a primeira letra em mai�sculo - salt 33423
	var form = document.getElementById(idGrid + "Form");
	if (form.style.display == "none") {
		GF_toggle(document.getElementById(form.id + "Toggle"));
	}
	GF_novoRegistro(idGrid);
}
function GF_getInputs(idGrid) {
	return jQuery("#"+idGrid+"Form [isInput=true]").not('[type=file]').get()

}
function GF_antesInserirRegistro(idGrid) {
	return true;
}
function GF_depoisInserirRegistro(idGrid) {
}
function GF_desabilitaInputSelect(gridForm) {
	var tabelas = gridForm.getElementsByTagName("TABLE");
	for (var i = 0; i < tabelas.length; i++) {
		var tabela = tabelas[i];
		if (isInputSelect(tabela)) {
			limparInputSelect(tabela.id);
			if (temFilho(tabela)) {
				desabilitaInputsFilhos(tabela, document);
			}
		}
	}
}

function waitToSubmit(){
	while(!IS_enableSubmit){
    	setTimeout('', 100);
    }

	return true;
}

function GF_inserirNovaLinha(idGrid) {
	var grid = document.getElementById(idGrid);
	var form = document.getElementById(idGrid + "Form");
	var inputsText = GF_getInputs(idGrid);

	if(waitToSubmit()){
		if (GF_validaCampos(inputsText) && GF_antesInserirRegistro(idGrid)) {
			var ids = new Array();
			var values = new Array();
			var input;
			for (var i = 0; i < inputsText.length; i++) {
				input = inputsText[i];
				if (input.getAttribute("inputCheckBox") != null && input.getAttribute("inputCheckBox") == "true") {
					continue;
				}
				ids[i] = input.id;
				if (input.type == "checkbox") {
					if (input.checked) {
						values[i] = input.value;
					} else {
						var uncheckedValue = input.getAttribute("uncheckedValue");
						if (uncheckedValue == null) {
							values[i] = "";
						} else {
							values[i] = uncheckedValue;
						}
					}
				} else {
					if (input.type == "radio") {
						if (input.checked) {
							values[i] = input.value;
						} else {
							ids[i] = "";
						}
					} else {
						values[i] = input.value;
					}
				}
				input.setAttribute("gf_oldValue", values[i]);
			}
			var linha;
			if (GF_isModoEdicao(idGrid)) {
				linha = form.getAttribute("edit");
				changeActionGrid(grid, linha, "U");
			} else {
				criarNovaLinha(grid, false);
				var rowCount = getNuLinhas(document, idGrid);
				linha = rowCount - 1;
			}
			for (var i = 0; i < ids.length; i++) {
				try {
					if (ids[i] != "") {
						var componente = getComponente(idGrid, ids[i], linha);
						if (componente.type == "checkbox") {
							componente.checked = (values[i] == componente.getAttribute("value"));
							CH_updateHiddenValue(componente);
						} else {
							componente.value = values[i];
						}
					}
				}
				catch (err) {
					//campo nao existe
				}
			}
			if (!GF_isModoEdicao(idGrid)) {
				GF_novoRegistro(idGrid);
				GF_scrollFimGrid(idGrid);
				GF_atualizaCoresLinhas(idGrid, null);
				GF_desabilitaInputSelect(form);
			}
			GF_depoisInserirRegistro(idGrid);
		}
	}
}
function GF_isModoEdicao(idGrid) {
	var form = document.getElementById(idGrid + "Form");
	var edit = form.getAttribute("edit");
	return edit != null && edit != "";
}
function GF_scrollFimGrid(idGrid) {
	document.getElementById("la" + idGrid).scrollTop = document.getElementById("la" + idGrid).scrollHeight;
}
function GF_atualizaCoresLinhas(idGrid, index) {
	var trs = document.getElementById("tabela" + idGrid).getElementsByTagName("TR");
	for (var i = 0; i < trs.length; i++) {
		var currentIndex = getFieldIndex(trs[i].id);
		if((index != null && currentIndex == index)
			|| (indexRegistroOld_GF != null && currentIndex == indexRegistroOld_GF)){
			if (trs[i].getAttribute("linha") == "true") {
				var grid = getGrid(trs[i]);
				var idAcao = getColumnId(grid, "status", i - 1);
				var acaoLinha = document.getElementById(idAcao);
				if (new String(acaoLinha.value).charAt(0) != "D") {
					mudarCorLinha(trs[i], "new");
				} else {
					mudarCorLinha(trs[i], "del");
				}
			}
		}
	}
}
function GF_validaCampos(campos) {
	for (var j = 0; j < campos.length; j++) {
		var campo = campos[j];
		if (new String(campo.getAttribute("disabled")).toUpperCase() != "TRUE") {
			if (!C_verificaValor(campo)) {
				formatType = campo.getAttribute("formatType");
				iCampo = campo.id;
				exibeMensagem(formatType, campo);
				return false;
			}
			if (new String(campo.getAttribute("obrigatorio")).toUpperCase() == "TRUE") {
				if (!C_verificaObrigatorio(campo)) {
					return false;
				}
			}
		}
	}
	return true;
}
function GF_depoisNovoRegistro(idGrid) {
}
function GF_novoRegistro(idGrid) {
	GF_atualizaCoresLinhas(idGrid, null);
	GF_limpaCamposForm(idGrid);
	var form = document.getElementById(idGrid + "Form");
	form.setAttribute("edit", "");
	GF_setFocusCampo(idGrid, 0);
	GF_depoisNovoRegistro(idGrid);
}
function GF_limpaCamposForm(idGrid) {
	var inputs = GF_getInputs(idGrid);
	var form = document.getElementById(idGrid + "Form");
	var selects = form.getElementsByTagName("SELECT");
	if (GF_existeCampoAlterado(idGrid)) {
		if (confirm(msgKey("label.js.confirmaFormularioAlterado"))) {
			GF_inserirNovaLinha(idGrid);
		}
	}
	for (var m = 0; m < inputs.length; m++) {
		var input = inputs[m];
		if (input.getAttribute("input-select") != null) {
			limparInputSelect(input.getAttribute("input-select"));
			IS_limparFilhos(input.getAttribute("input-select"));
		} else {
			if (input.type == "checkbox") {
				input.checked = false;
			} else {
				if (input.type == "radio") {
					input.checked = false;
				} else {
					inputs[m].value = "";
				}
			}
		}
		input.setAttribute("gf_oldValue", "");
		input.setAttribute("modified", "false");
	}
	for (var j = 0; j < selects.length; j++) {
		var select = selects[j];
		select.selectedIndex = 0;
		select.setAttribute("modified", "false");
	}
}
function GF_existeCampoAlterado(idGrid) {
	var inputs = GF_getInputs(idGrid);
	var form = document.getElementById(idGrid + "Form");
	if (GF_isModoEdicao(idGrid)) {
		for (var m = 0; m < inputs.length; m++) {
			var input = inputs[m];
			if (input.type == "checkbox" || input.type == "radio") {
				if (input.checked && input.getAttribute("gf_oldValue") != input.value) {
					return true;
				} else {
					if (!input.checked && input.getAttribute("gf_oldValue") == input.value) {
						return true;
					}
				}
			} else {
				if (input.getAttribute("gf_oldValue") != input.value) {
					return true;
				}
			}
		}
	}
	return false;
}
function GF_antesEditarRegistro(idGrid, index) {
	return true;
}
function GF_depoisEditarRegistro(idGrid) {
}
function GF_marcaInputsComoNaoModificados(grid) {
	var inputs = GF_getInputs(grid.id);
	for (var m = 0; m < inputs.length; m++) {
		var input = inputs[m];
		try {
			input.setAttribute("modified", "false");
		}
		catch (err) {
			//campo nao existe..
		}
	}
}
function GF_editaRegistro(obj, posicionarFoco) {
	var grid = getGrid(obj);
	var idGrid = grid.id;
	var index = getFieldIndex(obj.id);
	var idGridForm = idGrid + "Form";
	var form = document.getElementById(idGridForm);
	if (form.getAttribute("editable") != "false") {
		if (GF_antesEditarRegistro(idGrid, index)) {
			var form = document.getElementById(idGridForm);
			var objLinha = obj;
			while (objLinha != null && objLinha.nodeName != "TR") {
				objLinha = objLinha.parentNode;
			}
			if (posicionarFoco) {
				GF_abrirGridForm(idGrid);
			}

			GF_atualizaCoresLinhas(idGrid, index);
			indexRegistroOld_GF = getFieldIndex(obj.id);

			if (obj.readOnly) {
				mudarCorLinha(objLinha, "focus");
			} else {
				mudarCorLinha(obj, "focus");
			}
			GF_limpaCamposForm(idGrid);
			var linha = objLinha.id.substring(objLinha.id.indexOf("_") + 1);
			form.setAttribute("edit", linha);
			var inputs = GF_getInputs(idGrid);
			for (var m = 0; m < inputs.length; m++) {
				var input = inputs[m];
				try {
					if (input.type == "checkbox" || input.type == "radio") {
						var componente = getComponente(idGrid, input.id, linha);
						if (componente.type == "checkbox" || componente.type == "radio") {
							if (componente.checked) {
								input.checked = true;
								input.setAttribute("gf_oldValue", input.value);
							} else {
								input.checked = false;
								var uncheckedValue = input.getAttribute("uncheckedValue");
								if (uncheckedValue == null) {
									input.setAttribute("gf_oldValue", "");
								} else {
									input.setAttribute("gf_oldValue", uncheckedValue);
								}
							}
							if (input.type == "checkbox") {
								CH_updateHiddenValue(input);
							}
						} else {
							var componenteValue = componente.value;
							if (componenteValue == input.value) {
								input.checked = true;
								input.setAttribute("gf_oldValue", input.value);
							} else {
								input.checked = false;
								input.setAttribute("gf_oldValue", "");
							}
						}
					} else {
						var inputDaGrid = getComponente(idGrid, input.id, linha);

						if (input.tagName == "SELECT" && inputDaGrid.value == "") {
							input.selectedIndex = 0;
						} else {
							input.value = inputDaGrid.value;

							// verifica se � um input-select
							var inputSelectTableId_tmp = input.getAttribute("input-select");
							if (inputSelectTableId_tmp != null) {
								IS_limparFilhos(inputSelectTableId_tmp);
							}
						}
						input.setAttribute("gf_oldValue", input.value);
						//Responsavel por copiar o formato da linha da grid para o grid:gridForm
						if (inputDaGrid.getAttribute("formato")) {
							input.setAttribute("formato", inputDaGrid.getAttribute("formato"));
						}
					}
				}
				catch (err) {
					//campo nao existe..
				}
			}
			if (posicionarFoco) {
				GF_setFocusCampo(idGrid, 0);
			}
			GF_marcaInputsComoNaoModificados(grid);
			GF_depoisEditarRegistro(idGrid);
		} else {
			//se for false ele permite somente a altera��o de cores das linhas selecionadas.
			var objLinha = obj;
			while (objLinha != null && objLinha.nodeName != "TR") {
				objLinha = objLinha.parentNode;
			}
			if (posicionarFoco) {
				GF_abrirGridForm(idGrid);
			}
			GF_atualizaCoresLinhas(idGrid, index);
			if (obj.readOnly) {
				mudarCorLinha(objLinha, "focus");
			} else {
				mudarCorLinha(obj, "focus");
			}
		}
	}
}
function GF_doEvent(event) {
	if ((window.event ? event.keyCode : event.which) == 13) {
		var grid;
		if (jQuery.browser.msie) {
			grid = getGrid(event.srcElement);
		} else {
			grid = getGrid(event.target);
		}
		C_CancelaEvento(event);
		GF_inserirNovaLinha(grid.id);
	}
}
function GF_setFocusCampo(idGrid, index) {
	try {
		GF_getInputs(idGrid)[index].focus();
	}
	catch (err) {
		//campo nao existe..
	}
}
function GF_onfocus(linha, event) {
	if (jQuery.browser.mozilla) {
		isGFChangeValues = false;
	}
	GF_editaRegistro(linha, false);
	isGFChangeValues = true;
}
function GF_onchange(campo) {
	campo.setAttribute("modified", true);
}
function GF_onblur(obj) {
	var grid = getGrid(obj);
	var form = document.getElementById(grid.id + "Form");
	if (form.getAttribute("editable") != "false") {
		var objLinha = obj;
		while (objLinha != null && objLinha.nodeName != "TR") {
			objLinha = objLinha.parentNode;
		}
		mudarCorLinha(objLinha, "focus");
		//GF_editaRegistro(objLinha,false);
		if (!jQuery.browser.mozilla || isGFChangeValues) {
			GF_changeValuesFromGridToGridForm(objLinha);
		}
	}
}

//c�digo replicado de spwImageHigh para que altera��es em tal arquivo n�o reflitam no gridForm.
function GF_toggle(obj) {
	var div = document.getElementById(obj.getAttribute("divId"));
	if (obj != null) {
		if (div.style.display == "none") {
			div.style.display = "";
			IH_mOver(obj);
			obj.src = obj.src.substring(0, obj.src.indexOf("-c")) + obj.src.substring(obj.src.indexOf("-c") + 2, obj.src.length);
			IH_mOver(obj);
		} else {
			div.style.display = "none";
			IH_mOver(obj);
			obj.src = obj.src.substring(0, obj.src.length - 4) + "-c" + obj.src.substring(obj.src.length - 4, obj.src.length);
			IH_mOver(obj);
		}
	}
}
function GF_changeValuesFromGridToGridForm(obj) {
	var grid = getGrid(obj);
	//condi��o acrescentada para se o m�todo GF_antesEditarRegistro for sobreescrito retornando false,
	//n�o jogue os valores da grid para os campos do gridForm
	if (GF_antesEditarRegistro(grid.id)) {
		var objLinha = obj;
		while (objLinha != null && objLinha.nodeName != "TR") {
			objLinha = objLinha.parentNode;
		}
		var linha = objLinha.id.substring(objLinha.id.indexOf("_") + 1);
		var inputs = GF_getInputs(grid.id);
		for (var m = 0; m < inputs.length; m++) {
			var input = inputs[m];
			try {
				if (input.type == "checkbox" || input.type == "radio") {
					var componente = getComponente(grid.id, input.id, linha);
					if (componente.type == "checkbox" || componente.type == "radio") {
						if (componente.checked) {
							input.checked = true;
							input.setAttribute("gf_oldValue", input.value);
						} else {
							input.checked = false;
							var uncheckedValue = input.getAttribute("uncheckedValue");
							if (uncheckedValue == null) {
								input.setAttribute("gf_oldValue", "");
							} else {
								input.setAttribute("gf_oldValue", uncheckedValue);
							}
						}
						if (input.type == "checkbox") {
							CH_updateHiddenValue(input);
						}
					} else {
						var componenteValue = componente.value;
						if (componenteValue == input.value) {
							input.checked = true;
							input.setAttribute("gf_oldValue", input.value);
						} else {
							input.checked = false;
							input.setAttribute("gf_oldValue", "");
						}
					}
				} else {
					var inputDaGrid = getComponente(grid.id, input.id, linha);
					if (input.tagName == "SELECT" && inputDaGrid.value == "") {
						input.selectedIndex = 0;
					} else {
						input.value = inputDaGrid.value;
					}
					input.setAttribute("gf_oldValue", input.value);
					//Responsavel por copiar o formato da linha da grid para o grid:gridForm
					if (inputDaGrid.getAttribute("formato")) {
						input.setAttribute("formato", inputDaGrid.getAttribute("formato"));
					}
				}
			}
			catch (err) {
				//campo nao existe..
			}
		}
	}
}

function getComponente(gridId, inputId, linha){
	return document.getElementById(getColumnIdIndexed(gridId, inputId, linha));
}

//Vari�vel que armazena o objeto utilizado pelo inputSelect para copiar os valores e guarda a velha para alterar a cor
var tableItemMenuObjNew;
var tableItemMenuObjOld;

//Abre o gridForm do itemMenu
function GF_abrirGridFormItemMenu(idGrid, obj) {
	tableItemMenuObjOld = tableItemMenuObjNew;
	tableItemMenuObjNew = obj;
	mudaCoresTds(tableItemMenuObjOld, "");
	mudaCoresTds(tableItemMenuObjNew, "#FFFFCC");
	limparInputSelect("consTela");
	idGrid = upperFirstLetter(String(idGrid));
	var form = document.getElementById(idGrid + "Form");
	form.style.display = "";
}

function paginar(orientacao,form,action,numRegs,objName,nuMaxPags,
		orderByProperty,coluna,orderBySelected){

	if(!isSearchFilterValid()){
		return;
	}

	FF_desabilitaBotoes(form);
	var target = document.getElementById(objName);
	var orderBy = orderByProperty;
	var orderByAntigo = target.getAttribute('orderBy');
	var proxima = null;

	if(orderBy == 'null'){
		orderBy = orderByAntigo;
		if(orderBy == 'null'){
			orderBy = '';
		}
	}
	if(orderBy != ''){
		if(orderByAntigo.indexOf(orderByProperty) != -1){
			if(orderByAntigo.indexOf('asc') != -1){
				orderBy = orderByProperty + ' desc';
				refreshEstilosColunas(coluna,'desc');
			} else {
				orderBy = orderByProperty + ' asc';
				refreshEstilosColunas(coluna,'asc');
			}
		} else if(orderBy.indexOf('asc') == -1 && orderBy.indexOf('desc') == -1){
			orderBy = orderBy + ' asc';
			refreshEstilosColunas(coluna,'asc');
		}
	}
	if(orientacao == 'primeiro'){
		if(orderByProperty == 'null' && target.value == '0' && orderBySelected == null){
			return;
		}
		target.value = '0';
	} else if(orientacao == 'ultimo'){
		if(target.value == nuMaxPags){
			return;
		}
		target.value = nuMaxPags;
	} else if(orientacao == 'proximo'){
		if(target.value == nuMaxPags){
			return;
		}
		proxima = new Number(target.value) + 1;
		if(nuMaxPags >= proxima){
			target.value = proxima;
		} else {
			alert(msgKey('label.js.paginaLimite',nuMaxPags+1));
			return;
		}
	} else if(orientacao == 'anterior'){
		if(target.value == '0'){
			return;
		}
		target.value = new Number(target.value) - 1;
		if(target.value < 0){
			target.value = '0';
			alert(msgKey('label.js.paginaNegativa',''));
			return;
		}
	} else if(orientacao == 'estaPosicao'){
		if(target.value < 0){
			target.value = '0';
			alert(msgKey('label.js.paginaNegativa',''));
			return;
		} else if (target.value > nuMaxPags){
			alert(msgKey('label.js.paginaLimite',nuMaxPags+1));
			return;
		}
	}
	var formAction = jQuery(form).attr('action');
	if(formAction.indexOf("?") == -1){
		formAction = formAction + '?';
	} else {
		formAction = formAction + '&';
	}

	formAction = formAction+objName+'GridPageSize=' + numRegs +
	 '&'+objName+'GridPage=' + target.value+'&'+objName+
	 'GridPageOrderBy='+orderBy+
	 "&gridPaginadaName="+objName;

	 if(document.getElementById("multiselectinputselect") != null){
		var contador = document.getElementById('contador').value;
	 	formAction += "&contador="+contador;
	 }

	 if(orderBySelected != 'false' && orderBy.indexOf('checkboxes')!=-1){
	 	formAction += "&orderBySelected=true";
	 	if(contador == '0' || contador == ''){
	 		return;
	 	}
	 } else {
	 	formAction += "&orderBySelected=false";
	 }

	 jQuery(form).attr('action', formAction);

	 action = formAction;

	 jQuery(form).submit();
}

function executePesquisaPaginada( form, action, objName ) {
	if(!isSearchFilterValid()){
		document.getElementById('pbProcurar').disabled = false;
		return;
	}

	//Limpar os inputParans, pois em determinados casos, a cada pesquisa estava mantendo os j� valores selecionados
	cleanOldInputParans();
    if(verificaCamposObrigatorios(form)){
	    var formAction = jQuery(form).attr('action');
		if(formAction.indexOf("?") == -1){
			formAction = formAction + '?';
		} else {
			formAction = formAction + '&';
		}
		IS_restauraEstadoSelecao();
	 	formAction = formAction+objName+'GridPage=0';

	 	jQuery(form).attr('action', formAction);

        var formURL = document.getElementById("requesterUrl");
        if(formURL) {
            var valorCampo = formURL.value;
            if(valorCampo) {
                var index = valorCampo.indexOf('/search/');
                if(index > 0) {
                    formURL.value = valorCampo.substr(index);
                }
            }
        }
        // Adicionado esta linha na SALT 37460 para, quando for feita uma pesquisa na search, ele volte para a p�gina 1;
        //paginar('primeiro',form,action,8,objName,0,'null');
    	form.submit();
    } else {
    	document.getElementById('pbProcurar').disabled = false;
    }
}

function refreshEstilosColunas(obj,estilo){
	if(obj == ''){
		return;
	}
	var objTR = obj.parentNode;
	var tds = objTR.childNodes;

	var tdsTamanho = tds.length;

	for(var i = 0; i < tdsTamanho; i++){
		if(tds[i].tagName == 'TD'){
			tds[i].className = tds[i].className.substring(0,(tds[i].className.indexOf(' spwCabecalhoAsc') != -1? tds[i].className.indexOf(' spwCabecalhoAsc'):tds[i].className.length));
			tds[i].className = tds[i].className.substring(0,(tds[i].className.indexOf(' spwCabecalhoDesc') != -1? tds[i].className.indexOf(' spwCabecalhoDesc'):tds[i].className.length));
		}
	}
	if(estilo == 'asc'){
		obj.className = obj.className + ' spwCabecalhoAsc';
	} else if(estilo == 'desc'){
		obj.className = obj.className + ' spwCabecalhoDesc';
	}

}

function getParamNaLinhaGrid(obj,property,nomeGrid){
    var objTr = obj;
    while(objTr.nodeName != 'TR' && objTr != null){
        objTr = objTr.parentNode;
    }
    var id = objTr.getAttribute('id');
    if(id===null){
    	return;
    }
    var index = id.substring(id.indexOf('_')+1,id.length);
    var finalDoNome = property.substring(property.lastIndexOf('.'),property.length)+'_'+index;
    if(finalDoNome.substring(0,1)!= '.'){
       finalDoNome = '.'+finalDoNome;
    }
    var nomeComp = nomeGrid+'['+index+']'+ finalDoNome;
    return url_encode(new String(document.getElementById(nomeComp).value));
}

function habilitaBotao(botaoId){
	var botao = document.getElementById(botaoId);
	botao.disabled = false;
	indice = botao.className.indexOf('-');
	if(indice != -1){
		botao.className = botao.className.substring(botao.className, indice);
	}
}

function desabilitaBotao(botaoId){
	var botao = document.getElementById(botaoId);
	botao.disabled = true;
	var indice = botao.className.indexOf('-');
	if(indice == -1){
		botao.className = botao.className + '-d';
	}
}

function depoisPaginarGrid(sender){
}
/** Marca todos os itens na grid Paginada Checkbox **/
function selecionaTodosNaGridPaginadaCheckbox(ctrl, forcarSelecao) {
	var $ctrl = jQuery(ctrl);
	//Fun��o para ser sobreescrita caso necess�rio
	antesSelecionarTodosRegistrosGridPaginadaCheckBox($ctrl);

	var check = ctrl.checked;
    var grid = getGrid(ctrl);
    var gridId = grid.id;
    nuLinhas = getNuLinhas(document, getNomeGrid(grid));
    var $col_CbMultSel;
    for (i=0; i < nuLinhas; i++) {
    	$col_CbMultSel = jQuery('input[id$=cbMultSel_'+i+']'); //document.getElementById("cbMultSel"+gridId+"_"+i);
    	//Se existir objeto
    	if($col_CbMultSel){
    		//Se o estado atual do objeto for diferente do estado do checkbox seleciona/deseleciona todos
    		if(forcarSelecao || $col_CbMultSel.is(":checked") != check){
    			$col_CbMultSel.prop('checked',check);
    			selecionaNaGridPaginadaCheckbox($col_CbMultSel);
    		}
    	}
    }

    //Fun��o para ser sobreescrita caso necess�rio
    depoisSelecionarTodosRegistrosGridPaginadaCheckBox($ctrl);
}

/*Marca um iten espec�fco na grid Paginada Checkbox */
function selecionaNaGridPaginadaCheckbox(ctrl) {
	var $ctrl = jQuery(ctrl);
	//Fun��o para ser sobreescrita caso necess�rio
	antesSelecionarRegistroGridPaginadaCheckBox($ctrl);

	//Muda os names para o submit
	changeNameGridPaginadaCheckbox($ctrl);

    //Fun��o para ser sobreescrita caso necess�rio
    depoisSelecionarRegistroGridPaginadaCheckBox($ctrl);
}

/** Coloca o "name" em  todos campos da linha do obj baseado nos seus id's **/
function changeNameGridPaginadaCheckbox($ctrl) {
	var checked = $ctrl.is(":checked");

	//percorre todo os objetos da linha, alterando o "name" deles
	var linhaSel = $ctrl.parents("tr:first").get(0);
    lastDesc = getLastDesc(linhaSel);
    currentNode = linhaSel;
	if (lastDesc != null && currentNode != null) {
		do {
			currentNode = nextNode(currentNode);
			//verifica se o node corrente  um input e troca seus atributos
			if (currentNode.nodeName == "INPUT" ||
				currentNode.nodeName == "SELECT" ||
				currentNode.nodeName == "TEXTAREA") {
				//Se o input estiver com o atributo submit = true deve ser colocado ou retirado o name
				if(currentNode.getAttribute("submit") == "true"){
					if(checked){
						currentNode.setAttribute("name", getGridPaginadaCheckBoxFieldName(currentNode));
					}else{
						currentNode.removeAttribute("name");
					}
				}
			}
		} while (lastDesc != currentNode);
	}
}

function getGridPaginadaCheckBoxFieldName(){
	var property = currentNode.getAttribute("name_");
	var id = (new String(currentNode.id)).split(".");
	var posF = id[0];

	return posF+"."+property;
}

/*� utilizado o referenceName da grid, e tamb�m concatenado com 'GridPaginadaCurrentPage' para filtrar/garantir pelo name do input*/
function zeraGridPaginadaCurrentPageById(referenceName){
	var currentPageInputName;
	if(!referenceName.contains('GridPaginadaCurrentPage')){
		currentPageInputName = referenceName + 'GridPaginadaCurrentPage';
	}

	var $currentPage = jQuery('#'+referenceName).filter('[name=' + currentPageInputName + ']');
	zeraGridPaginadaCurrentPageByObj($currentPage);
}

function zeraGridPaginadaCurrentPageByObj(jQueryObj){
	jQueryObj.val('0');
}

/*� utilizado o id da grid para deselecionar todos os checkbox da gridPaginadaCheckbox*/
function deselecionaGridPaginadaCheckboxOnPagination(gridId){
	jQuery('#checkBoxMultSelGridPaginadaHeader'+gridId).removeProp('checked');

	jQuery('#'+gridId).find('tr').filter(function(){
		var $checkboxs = jQuery(this).find(':checkbox:checked');
		var $checkbox = $checkboxs.filter('[id*=cbMultSel_]');
		if($checkbox.size() > 0){
			$checkbox.attr('checked',false);
			return;
		}
	});
	limparCheckboxsAoAvancarPagina();
}

function limparCheckboxsAoAvancarPagina(){
	var botoesGrid = $('.spwRodapeGrid').find('[id^="bt"]');
	jQuery(botoesGrid).click(function(){
		jQuery('[type="checkbox"]').each(function(){
			removerNameDosRegistrosNaoMarcados(jQuery(this));
		});
		jQuery('#checkBoxMultSelGridPaginadaHeaderRow').focus();
	});
}

function removerNameDosRegistrosNaoMarcados(check){
	var selecionado = check.is(':checked');
	jQuery(check.parent().next()).find('input').each(function(){			
		if(!selecionado){
			var elemento = $(this);
			elemento.attr('property', elemento.attr('name'))
			elemento.removeAttr('name');
		}
	});
};

/*� utilizado o id da grid para retornar o objeto jQuery com os tr�s selecionados*/
function getTRsSelecionadosGridPaginadaCheckBox(gridId){
	var $trs = jQuery('#tabela'+gridId).find('tr').filter(function(){
		var $this = jQuery(this);
		return ($this.find(':checkbox:checked').filter('[id*=cbMultSel_]').size() > 0);
	});

	return $trs;
}

/*Fun��o criada para ser sobreescrita caso seja necess�rio adicionar algum comportamento antes de fazer a sele��o de um elementos*/
function antesSelecionarRegistroGridPaginadaCheckBox($ctrl){
}

/*Fun��o criada para ser sobreescrita caso seja necess�rio adicionar algum comportamento depois de fazer a sele��o de um elementos*/
function depoisSelecionarRegistroGridPaginadaCheckBox($ctrl){
}

/*Fun��o criada para ser sobreescrita caso seja necess�rio adicionar algum comportamento antes de fazer a sele��o de todos elementos*/
function antesSelecionarTodosRegistrosGridPaginadaCheckBox($ctrl){
}

/*Fun��o criada para ser sobreescrita caso seja necess�rio adicionar algum comportamento depois de fazer a sele��o de todos elementos*/
function depoisSelecionarTodosRegistrosGridPaginadaCheckBox($ctrl){
}
/* cria uma nova linha(tabela) filha */
function GT_newChild(obj){
	//pega a tabela da linha e copia
	var objTable = getTable(obj);
	var objTableNew = objTable.cloneNode(true);

	//seta as cores da TD clonada para branco
	mudaCoresTds(objTableNew, "");

	//cria a indenta��o
	var td1 = objTableNew.getElementsByTagName("TD")[0];
	var tdWidth = new Number(td1.width);
	td1.width = tdWidth + 20;

	//insere a tabela clonada e um div depois
	var objDiv = objTable.nextSibling;
	var newDiv = document.createElement("DIV");
	if(objDiv.childNodes[0] != null){
		objDiv.insertBefore(newDiv, objDiv.childNodes[0]);
		objDiv.insertBefore(objTableNew, objDiv.childNodes[0]);
	}else{
		objDiv.appendChild(objTableNew);
		objDiv.appendChild(newDiv);
	}

	//altera o name dos inputs da linha nova
	addItemMenuTable(objTableNew);
	cleanValueTable(objTableNew);

	//altera o name dos inputs dos irmaos da linha nova
	var objActual = objTableNew.nextSibling;
	while(objActual != null){
		if(objActual.nodeName == "TABLE"){
			increaseTable(objActual);
		}
		objActual = objActual.nextSibling;
	}

	printCode();
}

/* cria uma nova linha(tabela) abaixo */
function GT_newBrother(obj){
	//pega a tabela da linha e copia
	var objTable = getTable(obj);
	var objTableNew = objTable.cloneNode(true);
	cleanValueTable(objTableNew);
	//seta as cores da TD clonada para branco
	mudaCoresTds(objTableNew, "");

	//pega o proximo objeto depois do div da table
	var objNext = objTable.nextSibling.nextSibling;

	//insere a tabela e o div
	var newDiv = document.createElement("DIV");
	if(objNext == null){
		objTable.parentNode.appendChild(objTableNew);
		objTable.parentNode.appendChild(newDiv);
	}else{
		objTable.parentNode.insertBefore(objTableNew, objNext);
		objTable.parentNode.insertBefore(newDiv, objNext);
	}

	//aumenta o index das proximas linhas
	var objActual = objTableNew;
	while(objActual != null){
		if(objActual.nodeName == "TABLE"){
			increaseTable(objActual);
		}
		objActual = objActual.nextSibling;
	}

	printCode();
}

function GT_deleteRow(obj){
	var objLayer = document.getElementById("layerScroll");
	if(objLayer.getElementsByTagName("TABLE").length == 1){
		return
	}
	if(confirm(msgKey("label.js.confirmeExclusao",""))){
		var objTable = getTable(obj);

		//altera o name dos inputs das linhas seguintes
		var objActual = objTable.nextSibling;
		while(objActual != null){
			if(objActual.nodeName == "TABLE"){
				decreaseTable(objActual);
			}
			objActual = objActual.nextSibling;
		}
		//
		var objDiv = objTable.nextSibling;
		objTable.parentNode.removeChild(objTable);
		objDiv.parentNode.removeChild(objDiv);

	}
	printCode();
}

function getTable(obj){
	var table = obj
	while(table.nodeName != "TABLE"){
		table = table.parentNode;
	}
	return table;
}

function printCode(){
	return
	var objLayer = document.getElementById("layerScroll");
	var objCode = document.getElementById("code");
	objCode.value = objLayer.innerHTML;

}

function increaseInput(objInput, increaseValue){
	var nameObj = new String(objInput.name);
	var posKey1 = nameObj.lastIndexOf("[");
	var posKey2 = nameObj.lastIndexOf("]");
	var nuIndex = new Number(nameObj.substring(posKey1 + 1, posKey2));
	objInput.name = nameObj.substring(0, posKey1 + 1) + (nuIndex + increaseValue) + nameObj.substring(posKey2);
}

function increaseTable(objTable){
	var arrayInputs = objTable.getElementsByTagName("INPUT");
	var oldInput = "";
	var newInput = "";

	var arrayInputTamanho = arrayInputs.length;

	for(var i = 0; i < arrayInputTamanho; i++){
		if(i == 0){
			oldInput = arrayInputs[0].name;
		}
		increaseInput(arrayInputs[i], 1);
		if(i == 0){
			newInput = arrayInputs[0].name;
		}
	}
	/*var arraySelect = objTable.getElementsByTagName("SELECT");
	for(i = 0; i < arraySelect.length; i++){
		increaseInput(arraySelect[i], 1);
	}*/
	changeChildsTable(objTable, newInput, oldInput);
}

function decreaseTable(objTable){
	var arrayInputs = objTable.getElementsByTagName("INPUT");
	var oldInput = "";
	var newInput = "";

	var arrayInputTamanho = arrayInputs.length;

	for(var i = 0; i < arrayInputTamanho; i++){
		if(i == 0){
			oldInput = arrayInputs[0].name;
		}
		increaseInput(arrayInputs[i], -1);
		if(i == 0){
			newInput = arrayInputs[0].name;
		}
	}
	/*var arraySelect = objTable.getElementsByTagName("SELECT");
	for(i = 0; i < arraySelect.length; i++){
		increaseInput(arraySelect[i], -1);
	}*/
	changeChildsTable(objTable, newInput, oldInput);
}

function addItemMenuTable(objTable){
	var arrayInputs = objTable.getElementsByTagName("INPUT");
	var oldInput = "";
	var newInput = "";

    var arrayInputTamanho = arrayInputs.length;

	for(var i = 0; i < arrayInputTamanho; i++){
		if(i == 0){
			oldInput = arrayInputs[0].name;
		}
		addItemMenuInput(arrayInputs[i]);
		if(i == 0){
			newInput = arrayInputs[0].name;
		}

	}
	/*var arraySelect = objTable.getElementsByTagName("SELECT");
	for(i = 0; i < arraySelect.length; i++){
		addItemMenuInput(arraySelect[i]);
	}*/
	changeChildsTable(objTable, newInput, oldInput);
}

function addItemMenuInput(objInput){
	var nameObj = new String(objInput.name);
	var posKey = nameObj.lastIndexOf("]");
	objInput.name = nameObj.substring(0, posKey + 1) + ".itemMenu[0]" + nameObj.substring(posKey + 1);
}

function cleanValueTable(objTable){
	var arrayInputs = objTable.getElementsByTagName("INPUT");

	var arrayInputTamanho = arrayInputs.length;

	for(var i = 0; i < arrayInputTamanho; i++){
		//Para o checkBox � necess�rio manter o valor, sen�o n�o � salvo.
		if(arrayInputs[i].type != "checkbox"){
			arrayInputs[i].value = "";
		}
	}
	/*var arraySelect = objTable.getElementsByTagName("SELECT");
	for(i = 0; i < arraySelect.length; i++){
		arraySelect[i].selectedIndex = 0;
	}*/
}

//altera o name de todos inputs da div
function changeChildsTable(objTable, newInput, oldInput){
	//pega a posi��o do "valor antigo do name" do input
	var posLastPointOldInput = oldInput.lastIndexOf(".");
	//pega a posi��o do "valor novo do name" do input
	var posLastPointNewInput = newInput.lastIndexOf(".");
	//recupera o novo prefixo com base no "valor novo do name" do input
	var prefixeName = newInput.substring(0, posLastPointNewInput);
	//pega os elementos dentro da div
	var objDiv = objTable.nextSibling;
	var arrayInputs = objDiv.getElementsByTagName("INPUT");

	var arrayInputTamanho = arrayInputs.length;

	for(var i = 0; i < arrayInputTamanho; i++){
		nameInput = new String(arrayInputs[i].name);
		arrayInputs[i].name = prefixeName + nameInput.substring(posLastPointOldInput);
	}
	/*var arraySelect = objDiv.getElementsByTagName("SELECT");
	for(i = 0; i < arraySelect.length; i++){
		nameSelect = new String(arraySelect[i].name);
		arraySelect[i].name = prefixeName + nameSelect.substring(posLastPointOldInput);
	}*/
}

/* Copia o valor do inputSelect de telas para os campos referentes a tela do item menu */
function GT_copyFromInputSelectToItemMenu(){
	if(confirm('Deseja realmente alterar este item?')){
		var objTable = getTable(tableItemMenuObjNew);
		var arrayInputs = objTable.getElementsByTagName("INPUT");

		var arrayInputTamanho = arrayInputs.length;

		for(var i = 0; i < arrayInputTamanho; i++){
			var nameObj2 = new String(arrayInputs[i].name);

			if(nameObj2.indexOf(".idTela") != -1){
				arrayInputs[i].value =	document.getElementById('IScdSistema').value+";"+
				document.getElementById('tela.telaPK.cdTela').value+";"+document.getElementById('IScdFuncao').value;
			}
			if(nameObj2.indexOf(".nmTela") != -1){
				arrayInputs[i].value = document.getElementById('tela.nmForm').value;
			}
		}

		//Fecha o form do inputSelect
		document.getElementById('RowForm').style.display = 'none';
	}
}

function mudaCoresTds(tableItemMenuObj, cor){
	if(tableItemMenuObj != null && tableItemMenuObj != 'UNDEFINED'){
		var objTable = getTable(tableItemMenuObj);
		var tds = objTable.getElementsByTagName('TD');
		var tdsTamanho = tds.length;

		for(var i = 0; i < tdsTamanho; i++){
			tds[i].style.backgroundColor = cor;
		}
	}
}
/** carrega a imagem de troca **/
function IH_imageLoad(obj) {
	var image = null;

	if (typeof(obj) == "string") {
		var args = IH_imageLoad.arguments;
		for(i = 0; i < args.length; i++) {
			image = new Image;
			image.src = changeName(args[i])
		}
	} else {
		image = new Image;
		image.src = changeName(obj.src)
	}
}

function IMG_isNameWithSufix(imgname, sufix){
	if(imgname.length >= 4 && imgname.charAt(imgname.length - 4) == '.'){
		var oneSufix = (imgname.length >= 6 && imgname.charAt(imgname.length - 6) == '-');
		var twoSufix = (imgname.length >= 8 && imgname.charAt(imgname.length - 8) == '-');
		if(oneSufix){
			var firstSufix = imgname.charAt(imgname.length - 5);
			if(twoSufix){
				var secondSufix = imgname.charAt(imgname.length - 7);
				return (firstSufix == sufix || secondSufix == sufix);
			}else{
				return (firstSufix == sufix);
			}
		}
	}
	return false;
}

function IMG_isEnabled(img){
  return !IMG_isNameWithSufix(img.src, 'd');
}

function IMG_enable(img, newEnabled){
	if(newEnabled){
		img.src = IMG_getOriginalName(img.src)
		if(navigator.appName == "Netscape"){
			img.style.cursor = "pointer";
		}else{
			img.style.cursor = "hand";
		}
	}else{
		img.src = IMG_getDisabledName(img.src)
		img.style.cursor = "";
	}
}

function IMG_getOriginalName(imgname){
	var imgname;

	if(IMG_isNameWithSufix(imgname, 'o') || IMG_isNameWithSufix(imgname, 'd')){
		var tipo = imgname.substr(imgname.length  - 3);
		imgname = imgname.substr(0, imgname.length - 6) + '.' + tipo;
		return IMG_getOriginalName(imgname);
	}else{
		return imgname;
	}
}

function IMG_assembleName(imgname, sufix){
	var tipo = imgname.substr(imgname.length  - 3);
	return imgname.substr(0, imgname.length - 4) + sufix + '.' + tipo;
}

function IMG_getDisabledName(imgname){
	return IMG_assembleName(IMG_getOriginalName(imgname), '-d');
}

function IMG_getOverName(imgname){
	return IMG_assembleName(IMG_getOriginalName(imgname), '-o');
}

/** Se a imagem tiver '-o' tira se nao coloca **/
function changeName(name) {
	var tipo = name.substr(name.length  - 3);
	var posMenos = name.lastIndexOf("-");
	var sufixo = "-o.";
	if ((posMenos > 0) && (name.substr(posMenos, String(sufixo).length) == sufixo)) {
		return name.substr(0, name.length - 6) + "." + tipo;
	} else {
		return name.substr(0, name.length - 4) + sufixo + tipo;
	}
}

/** troca a imagem e o cursor **/
function imageChange(obj) {
	var cursor = null;
	if(navigator.appName == "Netscape"){
		cursor = "pointer";
	}else{
		cursor = "hand";
	}
	obj.style.cursor = cursor;
	obj.src = changeName(obj.src)
}

/** Se a imagem tiver '-o' tira se nao coloca, os atributos podem ser o objeto ou um conjunto de ids **/
function IH_mOver(obj){
	if (typeof(obj) == "string") {
		var args = IH_mOver.arguments;
		for(var i = 0; i < args.length; i++) {
			var objImg = document.getElementById(args[i]);
			if (objImg != null) {
				if(IMG_isEnabled(obj)){
					imageChange(objImg);
				}
			}
		}
	} else {
		if(IMG_isEnabled(obj)){
			imageChange(obj);
		}
	}
}

function IH_mOut(obj){
	IH_mOver(obj)
}

function IH_toggleOver(obj){
	IH_mOver(obj);
}

function IH_toggle(obj){
	var div = document.getElementById(obj.getAttribute('divId'));
	IH_toogleDiv(div);
}

function IH_toogleDiv(div){
	var divId = div.id;
	var obj = document.getElementById("toggleImg_" + divId);
	if(obj != null){
		if(div.style.display == 'none'){
			div.style.display = "";
			IH_mOver(obj);
			obj.src = obj.src.substring(0, obj.src.indexOf('-c')) + obj.src.substring(obj.src.indexOf('-c') + 2, obj.src.length);
			IH_mOver(obj);
		} else {
			div.style.display = 'none';
			IH_mOver(obj);
			obj.src = obj.src.substring(0,obj.src.length - 4) + '-c' + obj.src.substring(obj.src.length - 4, obj.src.length);
			IH_mOver(obj);
		}
	}
}

function IH_toggleOut(obj){
	IH_mOver(obj);
}
function logOnPage(text){
	var log = document.getElementById('log');
	if(log){
		log.appendChild(document.createTextNode(text));
	}
}

/*
 * Verifica se o resultado de uma pesquisa com a InputSelectTag retornou o elemento "cls".
 * Retorna TRUE caso nao tenha encontrado o elemento "clear" ou FALSE caso contrario.
 */
function clearTagPresent(reqAtual) {
    var clear = reqAtual.responseXML.getElementsByTagName("cls")[0];
   	if( clear == null ) {
   		return false;
   	}
   	return true;
}

function moreThanOneElemTagPresent(reqAtual) {
    var more = reqAtual.responseXML.getElementsByTagName("m")[0];
   	return ( more != null );
}

/*
 * Verifica se o resultado de uma pesquisa com a InputSelectTag retornou uma excessao.
 * Retorna TRUE caso nao tenha acontecido uma excessao ou FALSE caso contrario.
 */
function exceptionTagPresent(reqAtual) {
	try {
		var exception = reqAtual.responseXML.getElementsByTagName("ex")[0];

		if (reqAtual.responseText.indexOf("<title>Login</title>") != -1) {
			logoutOnExceptionTagPresent();
			return true;
		}
		if( exception != null ) {
			// label para mensagem em caso de exce��o
			alert(resourceMap.getResource('label.js.ajax.exception'));
   			return true;
   		}
   		return false;
	} catch (err) {
		if (reqAtual.responseText.indexOf("<title>Login</title>") != -1) {
			logoutOnExceptionTagPresent();
		}
		return true;
	}
}

/*
 * M�todo para ser sobrescrito e executar
 * o logout de acordo com o sistema
 */
function logoutOnExceptionTagPresent() {
	window.location.reload();
}

/*
 * Limpa os campos referenciados pela InpuSelectTag passando um array com os nomes dos campos.
 * @DEPRECATED utilize limparInputSelect(id)
 */
function limparCamposInputSelect(sender, arrayCampos ) {
      limparInputSelect(sender);
}

function IS_limpaHiddens(id) {
	var arrayCampos = eval(id + "NomeCamposArray");
    var arrLength = arrayCampos.length;
    for( var i = 0; i < arrLength; i++ ) {
	   var refName = nomeCampoEquivalenteBinding(id,arrayCampos[i]);
	   var input = IS_getInputFromInputSelect(id,refName);
	   if( input != null ) {
	       input.value = "";
	       input.setAttribute("oldValue","");
	       // verificar se � um is com pai e definir a classe para disabled
	   }
    }
}

function IS_limpaDivsMult(id) {
	if(IS_isMultiplaSelecao(document.getElementById(id))){
		IS_clearInputParamValue(document, id);
   		IS_zeraContadorSelecionados(document, id);
   		var divsExistentes = document.getElementById(id).getElementsByTagName('DIV');
		for(var k = divsExistentes.length - 1; k >= 0 ; k--){
			if(divsExistentes[k].getAttribute('multSelecao') == 'true'){
				divsExistentes[k].parentNode.removeChild(divsExistentes[k]);
			}
		}
	}
}
/*
 * Limpa todos os campos referenciados pela InpuSelectTag, mesmo aqueles que n�o est�o dentro do componente.
 */
function limparInputSelect(id) {
   if(antesLimparInputSelect(id)){
	   IS_limpaHiddens(id);
       IS_limpaDivsMult(id);
   }
   depoisLimparInputSelect(id);
}

/**
 * Retorna um campo que est� contido dentro do inputSelect.
 */
function IS_getInputFromInputSelect(inputSelectId, inputIdOrName) {
	var query = jQuery('#'+inputSelectId + ' input[id="'+inputIdOrName+'"]');
	var input = null;
	if(query.length != 0) {
		input = query[0];
	}
	if(input == null) {
		input = F_getElementByNameOrId(document,inputIdOrName);
	}
	return input;
}

/**
* Retorna o nome campo equivalente do campo utilizando
* a cole��o de bindings do input-select.
* Substitui o nomeCampoEquivalenteInputSelect caso o campos do inputselect
* utilizem o atributo bindingReference.
**/
function nomeCampoEquivalenteBinding(sender, ref){
	var inputSelect = document.getElementById(sender);
	if(inputSelect != null){
		var bindings = inputSelect.getAttribute('bindings');
		var bindName = "&bind_"+ref+"=";
		if(bindings != null && (bindings.indexOf(bindName) != -1)){
			var result = bindings.substring(bindings.indexOf(bindName)+bindName.length);
			if(result.indexOf('&') != -1){
				result = result.substring(0,result.indexOf('&'));
			}
			return result;
		}
		if (bindings == null || bindings === '') {
			return nomeCampoEquivalenteInputSelect(sender, ref);
		}
	}
	return null;
}

/*
 * Acao chamada antes de efetivamente limpar, se retornar false nao limpa os campos
 */
function antesLimparInputSelect(sender){
   return true;
}

/*
 * Acao chamada depois de limpar os campos
 */
function depoisLimparInputSelect(sender){
}

/*
 * Deleta as linhas da tabela da InputSelectTag.
 */
function inputSelectTag_deleteLinhasTabela(tabela) {
	var qtFilhos = tabela.childNodes.length;
	for(var i = 0; i < qtFilhos; i++){
		tabela.removeChild(tabela.lastChild)
	}
}

/**
 * Ao sair de um campo com inputSelect, e necessario verificar se o mesmo
 * possui algum valor digitado. Os seguintes casos podem ocorrer:
 * Se possuir valor no campo e o layer de resultado estiver visivel os campos sao deixados como estao.
 * Se possui valor em branco, os campos sao limpos.
 */
function getValueToSendWhenBlur(inputValue, inputId, cacheArray, layerVisivel) {
	if( inputValue == '' || jQuery.trim(inputValue) == '' ) {
		return '';
	}
	return this.value;
}

function getSelectedLineWhenBlur(tabela) {
	var selIndex = -1;
	var trLen = tabela.childNodes[0].childNodes.length
	for(var i = 0; i < trLen; i++ ) {
		trElmt = tabela.childNodes[0].childNodes[i];
		if( trElmt.style.backgroundColor != 'white' ) {
			selIndex = i;
			break;
		}
	}
	return selIndex;
}

/*
 * Retorna a posicao X de uma elemento do HTML.
 */
function getPositionX(obj){
    var posX = 0;
  	var corpo = document.getElementsByTagName("body")[0];
    var objAtual = obj;
    while( objAtual != corpo ) {
       posX += objAtual.offsetLeft - objAtual.scrollLeft;
       objAtual = objAtual.offsetParent;
    }
    return posX;
}

/*
 * Retorna a posicao Y de uma elemento do HTML.
 */
function getPositionY(element) {
    var targetTop = 0;
    if (element.offsetParent) {
        while (element.offsetParent) {
	         targetTop += element.offsetTop;
             element = element.offsetParent;
	     }
     } else if (element.y) {
	      targetTop += element.y;
     }
     return targetTop;
}

/**
 * Define a posicao de um Layer
 */
function setLayerPos( lyr, obj ) {
	var xPos = getPositionX( obj );
	var yPos = getPositionY( obj );
    lyr.style.left = xPos;
    lyr.style.top = yPos + obj.offsetHeight;
    lyr.style.width = obj.offsetWidth;
}

/*
 * Retorna o browser atual: IE ou Mozilla
 */
function getBrowser() {
   	var agt=navigator.userAgent.toLowerCase();
   	if( agt.indexOf("msie") > -1 ) {
     	    return "IE";
    } else {
          return "Mozilla";
    }
}

/*
 * Retorna o foco para um campo.
 */
function retornaFoco(nodo) {
	var campo = document.getElementById(nodo)
	if(campo != null){
		campo.focus();
	}
}

/*
 * Possibilita que o usuario execute alguma acao apos trocar o valor do campo de input.
 */
function onChangeInputSelect( sender ) {
}


/*
 * Seta o valor para comparacao em um proximo onBlur.
 */
function setOldValueInputSelect(id) {
	var arrayCampos = eval(id+"NomeCamposArray");
	var arrLength = arrayCampos.length
	for(var i = 0; i < arrLength; i++ ) {
		var refName = nomeCampoEquivalenteBinding(id,arrayCampos[i]);
		if(refName == null){
			refName = nomeCampoEquivalenteInputSelect(id,arrayCampos[i]);
		}
		var campo = F_getElementByNameOrId(document,refName);
	    if( campo!= null ) {
			campo.setAttribute('oldValue',campo.value);
        }
    }
}

/*
 * Metodo chamado para saber qual e o binding equivalente ao campo de filtro do inputselect
 * ao ser chamado a funcao de request do AJAX
 */
function getOriginalBindingRefNameOf(id, arrayRefNames, nomeCampoNoForm){
    var input = document.getElementById(nomeCampoNoForm);
	if (input == null) {
		input = parent.document.getElementById(nomeCampoNoForm);
	}
	if (input == null) {
		var arrayCampos = document.getElementsByName(nomeCampoNoForm);
		input = jQuery(arrayCampos).filter('input:first').get(0);
	}
    var bindingReference = input.getAttribute('bindingReference');
    if(bindingReference != null){
    	return bindingReference;
    }
    var arrRefNames = arrayRefNames.length;
    for(var i=0;i<arrRefNames;i++){
      var nomeEquiv = nomeCampoEquivalenteInputSelect(id,arrayRefNames[i]);
       if(nomeEquiv == nomeCampoNoForm){
          return arrayRefNames[i];
       }
    }
    return nomeCampoNoForm;

}

/*
 * Desabilita os inputs-select do array.
 */
function desabilitarCamposInputSelect(sender, arrayCampos ) {
   var arrCampos = arrayCampos.length;
   for(var i = 0; i < arrCampos; i++ ) {
       var refName = nomeCampoEquivalenteBinding(id,arrayCampos[i]);
		if(refName == null){
			refName = nomeCampoEquivalenteInputSelect(id,arrayCampos[i]);
		}
		var componente = F_getElementByNameOrId(document,refName);
       if( componente != null ) {
	       disable(componente);
       }
   }
}

/*
 * Desabilita um campo
 */
function disable(campo){
    var className = campo.className;
    if(className != "disabled"  && className.indexOf(" disabled ") == -1
    	&& !(FS_startsWith(className, "disabled ")) && !(FS_endsWith(className, " disabled"))){

	    campo.className = campo.className + " disabled";
	}
    campo.readOnly = true;
}

/*
 * Habilita um campo
 */

function enable(campo){
    campo.readOnly = false;
   	var className = campo.className;
   	if(className == "disabled"){
   		campo.className = "";
   		return;
   	}
    if(className.indexOf(" disabled ") != -1){
    	campo.className.replace(" disabled ", " ");
    	return;
    }
    if(FS_startsWith(className, "disabled ")){
    	campo.className = className.substring(9);
    	return;
    }
    if(FS_endsWith(className, " disabled")){
    	campo.className = className.substring(0,className.length - 9);
    	return;
    }

}


/*
 * Retorna os inputs-select filhos
 */
function getInputsSelectFilhos(inputSelect){
	return inputSelect.getElementsByTagName('FILHO');
}

function desabilitaInputsFilhos(inputSelect, doc){
	refreshInputsFilhos(inputSelect,doc,true);
}

function habilitaInputsFilhos(inputSelect, doc){
	refreshInputsFilhos(inputSelect,doc,false);
}

/*
 *	Desabilita ou habilita os campos dos inputs filhos
 */
function refreshInputsFilhos(inputSelect,doc,desabilita){
	var filhos = getInputsSelectFilhos(inputSelect);
	var filLength = filhos.length;
	for(var i = 0; i < filLength; i++){
		var filho = filhos[i];
		var filhoId = filho.getAttribute('idFilho');
		if(filhoId != null){
			var objIS = doc.getElementById(filhoId);
			limparInputSelect(filhoId);
			var inputsFilho = objIS.getElementsByTagName('INPUT');
			for(j = 0; j < inputsFilho.length; j++){
				var botaoLimpar = jQuery(inputsFilho[j]).parents('table.spwInputSelect').parents('tr:first');
				var btLimparEnabled = botaoLimpar.find('.btLimparInputSelect');
				var btLimparDisabled = botaoLimpar.find('.btLimparDisabledInputSelect');
				if(desabilita){
					disable(inputsFilho[j]);
					btLimparDisabled.show();
					btLimparEnabled.hide();
				} else {
					enable(inputsFilho[j]);
					btLimparDisabled.hide();
					btLimparEnabled.show();
				}
				setOldValueInputSelect(objIS.id);
			}
			if(temFilho(objIS)){
				refreshInputsFilhos(objIS,doc,true);
			}
			var imagens = objIS.getElementsByTagName('IMG');
			if(desabilita){
				imagens[0].style.display = 'none';
				imagens[1].style.display = 'inline';
			} else {
				imagens[0].style.display = 'inline';
				imagens[1].style.display = 'none';
			}
		}
	}
}

function desabilitaInputSelectById(id, doc){
	if(doc && doc != null){
		desabilitaInputSelect(doc.getElementById(id), doc);
	}else{
		desabilitaInputSelect(document.getElementById(id), document);
	}
}

function habilitaInputSelectById(id, doc){
	if(doc && doc != null){
		habilitaInputSelect(doc.getElementById(id), doc);
	}else{
		habilitaInputSelect(document.getElementById(id), document);
	}
}

function desabilitaInputSelect(inputSelect, doc){
	refreshInputSelect(inputSelect,doc,true);
}

function habilitaInputSelect(inputSelect, doc){
	refreshInputSelect(inputSelect,doc,false);
}

/*
 *	Desabilita ou habilita os campos do input-select
 */
function refreshInputSelect(inputSelect,doc,desabilita){
	var inputs = inputSelect.getElementsByTagName('INPUT');
	var inLength = inputs.length;
	for(var j = 0; j < inLength; j++){
		if(desabilita){
			disable(inputs[j]);
		} else {
			enable(inputs[j]);
		}
	}
	imagens = inputSelect.getElementsByTagName('IMG');
	var botaoLimpar = jQuery(inputSelect).parents('tr:first');
	var btLimparEnabled = botaoLimpar.find('.btLimparInputSelect');
	var btLimparDisabled = botaoLimpar.find('.btLimparDisabledInputSelect');
	if(desabilita){
		imagens[0].style.display = 'none';
		imagens[1].style.display = 'inline';
		btLimparEnabled.hide();
		btLimparDisabled.show();
	} else {
		imagens[0].style.display = 'inline';
		imagens[1].style.display = 'none';
		btLimparDisabled.hide();
		btLimparEnabled.show();
	}
}

/*
 *	Retorna true se o input-select possui filho
 */

function temFilho(inputSelect){
	if (inputSelect == null) {
		return false;
	} else {
		return getInputsSelectFilhos(inputSelect).length != 0;
	}
}

/*
 * Retorna true se o objeto for um input-select
 */
function isInputSelect(obj){
	return obj.getAttribute('input-select') != null;
}

/** Cria a caixa de consulta **/
var _idIframeConcat;
function abrirConsultaPorLink(obj, url, largura, altura,
		titulo,idObjRetorno,multiplaSelecao,inputSelectId, bindings, idIframe, desabilitarSelecionados){

	var haveDoctype = F_haveDoctype();
    alturaTitulo = 18;
    _idIframeConcat = jQuery.trim("spwConsulta"+idIframe);
	//verifica se a consulta ja esta aberta(default -> spwConsulta e caso n�o tenha verifica quaquer div que contenha spwConsulta)
	if(document.getElementById("spwConsulta") != null && verificaIframeDiv()) {
		return;
	}

	//pega dados da pag
	var objBody = document.getElementsByTagName("BODY")[0];
	var alturaPag = F_getBrowserHeight();
	var larguraPag = F_getBrowserWidth();
	var posScroll = jQuery(window).scrollTop();

	//cria a layer
	var laConsulta = document.createElement("DIV");
	laConsulta.id = _idIframeConcat;
	if(haveDoctype){
		laConsulta.style.position = "fixed";
		posScroll = 0;
	}else{
		laConsulta.style.position = "absolute";
	}
	laConsulta.style.width = largura + "px";
	laConsulta.style.height = altura + "px";
	laConsulta.style.left = ((larguraPag - largura) / 2) +"px";
	laConsulta.style.top = ((alturaPag - altura) / 2 + posScroll) + "px";
	laConsulta.className = "spwTabelaGrid";
	laConsulta.style.backgroundColor = "#ffffff";
	laConsulta.style.zIndex = 99;
    objBody.appendChild(laConsulta);

	//cria a tabela superior
	tabelaCons = document.createElement("TABLE");
	tabelaCons.cellPadding = 0;
	tabelaCons.cellSpacing = 0;
	tabelaCons.style.width = '100%';
	tabelaCons.className = "spwTituloGrid";
	cabCons = document.createElement("TBODY");
	tabelaCons.appendChild(cabCons);

	//cria a linha da tabela
	linhaCons = document.createElement("TR");
	cabCons.appendChild(linhaCons);

	//cria a primeira celula
	celula1Cons = document.createElement("TD");
	celula1Cons.height = alturaTitulo;
	linhaCons.appendChild(celula1Cons);
	texto1 = document.createTextNode(titulo);
	celula1Cons.appendChild(texto1);
	objBody.onmousemove = moverLayer;
	celula1Cons.onmousedown = iniciaMover;
	objBody.onmouseup = terminaMover;

	//cria a segunda celula
	celula2Cons = document.createElement("TD");
	linhaCons.appendChild(celula2Cons);

	celula2Cons.style.width = '20px';
	laConsulta.appendChild(tabelaCons);

	//
    var botaoFechar = document.createElement("a");
    botaoFechar.className = "spwBotaoFecharJanela";
    botaoFechar.appendChild(document.createTextNode('X'));
   	if (jQuery.browser.msie) {
   		if(jQuery.browser.version > 7){
   			jQuery(botaoFechar).click(function() {fecharConsultaById(jQuery.trim(idIframe))});
   		}else{
   			botaoFechar.setAttribute("onclick", function(){eval("fecharConsultaById('"+jQuery.trim(idIframe)+"')")});
   		}
	}else{
		jQuery(botaoFechar).click(function() {fecharConsultaById(jQuery.trim(idIframe))});
	}
	celula2Cons.appendChild(botaoFechar);

	//cria tabela para conter o iframe
	tabelaIframe = document.createElement("TABLE");
	linhaIframe = document.createElement("TR");
	celulaIframe = document.createElement("TD");
	tabelaIframe.id = "tabelaIframe";

    //Atualiza os parametros
    prmIdObjRetorno="idObjRetorno="+idObjRetorno;


    if (multiplaSelecao == 'true') {
        prmMultiSelection="multiselection=true";
    } else {
        prmMultiSelection="multiselection=false";
    }
    if (url.indexOf("?") < 0) {
        url=url+"?";
    } else {
        url=url+"&";
    }

	var complement = complementInputSelectRequestParameters(idObjRetorno);
	if(complement != null && complement != "" && (new String(complement)).charAt(0) != '&'){
		complement = "&" + complement;
    }
    var useAction = document.getElementById(idObjRetorno).getAttribute('useAction');

    url = url + prmIdObjRetorno + "&" + prmMultiSelection + complement + "&height=" + (altura-alturaTitulo) +
    	"&inputSelectId="+inputSelectId+"&CurrentMultSelecaoId="+idObjRetorno+
    	"&multSelecaoProperty="+document.getElementById(idObjRetorno).getAttribute('property')+
    	 "&gotInputParam=false" + bindings + "&useAction=" + useAction + '&requesterUrl=' + url +
    	 '&SpwInputSelectRequestOrigin=InputSelectSearchGrid'+'&desabilitarSelecionados='+desabilitarSelecionados;

    if(multiplaSelecao == 'true'){
        url+="&contador="+document.getElementById('contador'+idObjRetorno).value;
        url+="&contadorMaior="+document.getElementById('contadorMaior'+idObjRetorno).value;
        url+="&multiselectinputselect=true&gotInputParam=false";
    }

	//cria o iframe
	if( navigator.appName == "Netscape" ) {
		iframeConsulta = document.createElement("iframe");
		iframeConsulta.src = url;
		iframeConsulta.width = "100%";
		iframeConsulta.height = altura - alturaTitulo;
		iframeConsulta.frameBorder = "0";
        iframeConsulta.id = "layerFormConsulta";
		laConsulta.appendChild(iframeConsulta);
	} else {
        htmlIframe = "<iframe id='layerFormConsulta' frameBorder='0' style='width:100%; height:" + (altura - alturaTitulo) + "px' src='"+url+"'></iframe>";
		document.getElementById(_idIframeConcat).insertAdjacentHTML("beforeEnd", htmlIframe);
	}
}

/*Possibilita adicionar parametros a URL da quisicao AJAX do sender
passado como parametro.*/
function complementInputSelectRequestParameters( sender ) {
    return '';
}

function getFilterValue(inputSelect,doc,separator){
	var filtroP = inputSelect.getAttribute('filtroPai');
	var idP = inputSelect.getAttribute('idPai');
	if(filtroP != null && filtroP != 'null'){
		return  getFilterValueRecursive(inputSelect,doc,separator);
	} else {
		return '';
	}
}

function getFilterValueRecursive(is,doc,separator){
	var filtroP = is.getAttribute('filtroPai');
	var idP = is.getAttribute('idPai');
	var filter = '';
	if(idP != null &&  idP != 'null'){
		var pai = document.getElementById(idP);
		filter = getFilterValueRecursive(pai,doc,separator);
		var campo = document.getElementById(filtroP);
		return campo.getAttribute('id') + '=' + campo.value + (filter==''? '':separator+ filter);
	}else{
		return '';
	}

}

function isInputSelectFilled(inputSelect){
	var input = inputSelect.getElementsByTagName('INPUT')[0];
	var p = 1;
	while(input.type != 'text' && p < inputSelect.getElementsByTagName('INPUT').length){
		input = inputSelect.getElementsByTagName('INPUT')[p++];
	}
	return input.value != '';
}

function getInputSelect(input){
	var pai = input.parentNode;
	while(!isInputSelect(pai) && pai != null){
		pai = pai.parentNode;
	}
	return pai;
}

function IS_desmarcaTudo(input){
	var inputSelect = getInputSelect(input);
	var inputs = inputSelect.getElementsByTagName('INPUT');
	var p = 0;
	while(p < inputs.length){
		inputs[p++].value = "";
	}
	var inputParamValue = IS_getInputParamValue(document,inputSelect.id);
	if(inputParamValue!="" && inputParamValue!=null){
		var divId = inputParamValue.substring(6,inputParamValue.indexOf('^'));
		var div = document.getElementById(divId);
		if(div != null){
			div.parentNode.removeChild(div);
			decrementaContadorSelecionados(document, inputSelect.id);
			removeFromInputParam(document,inputSelect.id,divId);
		}
	}
}

function IS_onChangeMultSelecao(input){
	var inputSelect = getInputSelect(input);
	var inputSelectId = inputSelect.id;

	IS_clearInputParamValue(document, inputSelectId);
	IS_zeraContadorSelecionados(document, inputSelectId);
	var divsExistentes = inputSelect.getElementsByTagName('DIV');
	for(var k = divsExistentes.length - 1; k >= 0 ; k--){
		if(divsExistentes[k].getAttribute('multSelecao') == 'true'){
			divsExistentes[k].parentNode.removeChild(divsExistentes[k]);
		}
	}

	var chave = "";
	var chaveCandidata = "";
	var entityPKClass = inputSelect.getAttribute("entityPKClass");
	var inputs = inputSelect.getElementsByTagName('INPUT');
	for(var m = 0; m < inputs.length; m++){
		if(inputs[m].getAttribute('type') == 'text'){
			var campo = inputs[m];
			if(campo.getAttribute("pk") == "true") {
				chave += url_encode(campo.value) + ";"
			} else {
				var property = getAttribute(campo, 'name');
				if(property.toLowerCase().indexOf(entityPKClass.toLowerCase()+".") != -1){
					chaveCandidata += campo.value + ";"
				}
			}
		}
	}
	if(chave == ""){
		chave = chaveCandidata;
	}

	//Se a chave estiver vazia, � porque o input-select est� vazio.
	if(chave == "" || chave == ";"){
		return;
	}

	var divId = IS_createMultSelecaoDivId(inputSelect.id,chave);
	var div = criaDivDeInputs(document,divId);
	inputSelect.appendChild(div);
	incrementaContadorSelecionados(document,inputSelect.id);
	document.getElementById("contadorMaior"+inputSelect.id).value = 1;
	var property = inputSelect.getAttribute('property');
	addToInputParam(document,inputSelect.id,'DivID='+divId);
	for(var m = 0; m < inputs.length; m++){
		if(inputs[m].getAttribute('type') == 'text'){
			var campo = inputs[m];
			var name = property + '[0].'+ getAttribute(campo, 'name');
			var elemento = criaElemento(document,'INPUT', 'hidden',name,chave+campo.value,campo.value,getAttribute(campo, 'name'));
			div.appendChild(elemento);
			addToInputParam(document,inputSelect.id,'^'+name+'='+campo.value);
		}
	}
	addToInputParam(document,inputSelect.id,'$');

}

function onClickMultiplaSelecao(obj){
	var checked = obj.checked;
	var doc = document;
	var objRetorno = parent.document.getElementById(idObjRetorno);
	var linhaSel = obj.parentNode;
	while(linhaSel.nodeName != 'TR'){
		linhaSel = linhaSel.parentNode;
	}
	var property = objRetorno.getAttribute('property');
	var nodosRef = pegaReferencias( linhaSel );
	var posicaoLista = getContadorMaiorValue(doc,'');
	var chave = IS_getChaveRegistro(nodosRef);

   	var divId = IS_createMultSelecaoDivId(idObjRetorno,chave);
   	if(checked){
		incrementaContadorSelecionados(doc,'');
  		IS_registraCamposSelecionados(nodosRef, property, posicaoLista, chave, idObjRetorno, doc, divId);
	}else{
		decrementaContadorSelecionados(doc,'');
       	removeFromInputParam(doc,idObjRetorno,divId);
       	return;
    }
}

function onDoubleClickMultiplaSelecao(obj){
	var doc = document;
	var objRetorno = parent.document.getElementById(idObjRetorno);
	var linhaSel = obj.parentNode;
	while(linhaSel.nodeName != 'TR'){
		linhaSel = linhaSel.parentNode;
	}
	linhaSel.getElementsByTagName('INPUT')[0].checked = true;
	var property = objRetorno.getAttribute('property');
	var nodosRef = pegaReferencias( linhaSel );
	var posicaoLista = getContadorMaiorValue(doc,'');
	var chave = IS_getChaveRegistro(nodosRef);

   	var divId = IS_createMultSelecaoDivId(idObjRetorno,chave);

   	var inputParam = IS_getInputParamValue(doc,idObjRetorno);
   	if(inputParam.indexOf("DivID="+divId+'^') == -1){
	   	incrementaContadorSelecionados(doc,'');
	   	IS_registraCamposSelecionados(nodosRef, property, posicaoLista, chave, idObjRetorno, doc, divId);
	}

}

function IS_getChaveRegistro(tds){
	var chave = "";
	var chaveCandidata = "";
	var tdsLength = tds.length;
	for(var j = 0; j < tdsLength; j++ ) {
		var valorRetorno = SR_getValorCelulaSearchDoPadrao(tds[j]);
		if(ehChave(tds[j])) {
			//chave += url_encode(valorRetorno) + ";"
			chave += valorRetorno + ";"
		} else {
			var property = getAttribute(tds[j], 'property');
			if(ehChaveCandidata(property)){
				//chaveCandidata += url_encode(valorRetorno) + ";"
				chaveCandidata += valorRetorno + ";"
			}
		}
	}
	if(chave == ""){
		chave = chaveCandidata;
	}

	return chave;
}

function IS_createMultSelecaoDivId(idComponente, valorChave){
	return "div"+idComponente+trim(valorChave);
}

function IS_registraCamposSelecionados(nodosRef, property, posicaoLista, chave, idObjRetorno, doc, divId){
	addToInputParam(doc,idObjRetorno,'DivID='+divId);
	for( j = 0; j < nodosRef.length; j++ ) {
   	    var valorRetorno = SR_getValorCelulaSearchDoPadrao(nodosRef[j]);
   	    var reference = parent.nomeCampoEquivalenteForm(idObjRetorno, getAttribute(nodosRef[j], 'reference'));
   	    if (reference === null || reference === undefined) {
	    	reference = nomeCampoEquivalenteForm(idObjRetorno, getAttribute(nodosRef[j], 'reference'));
	    }
   	    var name = property + '['+ posicaoLista +'].'+ reference;
   	    var input = document.getElementById(idObjRetorno + 'SelectedEntitiesList');
   	    if (input != null) {
   	    	if (input.value.indexOf(name) != -1) {
   	    		novaPosicaoLista = new Number(posicaoLista + 1);
   	    		name = property + '['+ novaPosicaoLista +'].'+ reference;
   	    	}
   	    }
        addToInputParam(doc,idObjRetorno,'^');
	    addToInputParam(doc,idObjRetorno,name+'='+valorRetorno);

	    if(j + 1 == nodosRef.length){
    		addToInputParam(doc,idObjRetorno,'$');
    	}
    }
}

function cleanOldInputParans() {
	var objRetorno = document.getElementById("idObjRetorno");
	if (objRetorno != null) {
		var inputParam = document.getElementById(objRetorno.value+'SelectedEntitiesList');
		if (inputParam) {
			inputParam.value = "";
		}
	}
}

function criaDivDeInputs(doc,id){
	novoDiv = doc.createElement('DIV');
    novoDiv.setAttribute('id',id);
    novoDiv.setAttribute('multSelecao','true');
    novoDiv.setAttribute('remover','false');
    novoDiv.style.display = 'none';
    //debug...
/*    novoDiv.appendChild(doc.createTextNode(id));
    novoDiv.style.height = 10;
    novoDiv.style.width = 10;
    novoDiv.className = 'erro';*/
    return novoDiv;
}

function criaElemento(doc,element,type,name,id,value,property){
	novoElemento = doc.createElement(element);
    novoElemento.setAttribute('type',type);
    novoElemento.name = name;
    novoElemento.setAttribute('id',id);
    novoElemento.setAttribute('value',value);
    novoElemento.setAttribute('property',property);
    return novoElemento;
}

function addToInputParam(doc,objId,str){
	var objRetorno = doc.getElementById(objId);
	var inputParam = doc.getElementById(objId+'SelectedEntitiesList');
	if(inputParam == null){
		inputParam = criaElemento(doc,'INPUT', 'hidden', objId+'SelectedEntitiesList',
								  objId+'SelectedEntitiesList', str);
		//o INPUT PARAM deve ser criado no form para ir para o servidor
		//com o submit!!!!
		document.getElementsByTagName("FORM")[0].appendChild(inputParam);
	} else {
		var v = inputParam.value;
		if(v == null || v == 'null'){
			v = '';
		}
		inputParam.value = v + trim(str);
	}
}

function IS_inputParamToArray(doc,objId){
	var result = new Array();
	var v = IS_getInputParamValue(doc, objId);
	var i = 0;
	while(v != null && v != ''){
		result[i] = v.substring(0,v.indexOf('$')+1);
		v = v.substring(v.indexOf('$')+1);
		i++;
	}

	return result;
}

function removeFromInputParam(doc,objId,divId){
	var retorno = false;
	var objRetorno = doc.getElementById(objId);
	var inputParam = doc.getElementById(objId+'SelectedEntitiesList');
	var v = inputParam.getAttribute('value');
	if(v != null){
		var posicao = v.indexOf("DivID="+divId+'^');
		if(posicao > -1){
			subV = v.substring(posicao,v.length);
			//alert(subV.substring(0,subV.indexOf('$')));
			resto = subV.substring(subV.indexOf('$')+1,subV.length);
			v = v.substring(0,posicao) + resto;
			retorno = true;
		}
		inputParam.setAttribute('value', v);
	}
	return retorno;
}

function IS_getInputParamValue(doc,objId){
	var objRetorno = doc.getElementById(objId);
	var inputParam = doc.getElementById(objId+'SelectedEntitiesList');
	if(inputParam != null){
		return inputParam.getAttribute('value');
	}
	return null;
}

function IS_clearInputParamValue(doc,objId){
	var inputParam = doc.getElementById(objId+'SelectedEntitiesList');
	if(inputParam != null){
		inputParam.value = "";
	}
}

function alteraValorContadorSelecionados(valor,doc,objId){
	var contador = doc.getElementById("contador"+objId);
	if(contador == null){
		var objRetorno = doc.getElementById(objId);
		contador = criaElemento(doc,'INPUT','hidden',"contador"+objId,"contador"+objId,valor);
	    objRetorno.appendChild(contador);
	}else{
		var value = new Number(contador.getAttribute('value'));
		contador.setAttribute('value', value+valor);
	}
}

function IS_zeraContadorSelecionados(doc,objId){
	var inputSelect = doc.getElementById(objId);
	var contador = doc.getElementById("contador"+objId);
	if(contador == null){
		contador = criaElemento(doc,'INPUT','hidden',"contador"+objId,"contador"+objId,0);
	    inputSelect.appendChild(contador);
	}else{
		var value = 0;
		contador.setAttribute('value', value);
	}
}

function IS_restauraEstadoSelecao(){
	var inputSelect = parent.document.getElementById(idObjRetorno);
	if(IS_isMultiplaSelecao(inputSelect)){
		var parentContador = parent.document.getElementById("contador"+idObjRetorno);
		var valor = 0;
		if(parentContador != null){
			valor = parentContador.value;
		}

		var contador = document.getElementById("contador");
		if(contador != null){
			contador.value = valor;
		}

		var parentInputParam = parent.document.getElementById(idObjRetorno+'SelectedEntitiesList');
		valor = "";
		if(parentInputParam != null){
			valor = parentInputParam.value;
		}
		var inputParam = document.getElementById(idObjRetorno+'SelectedEntitiesList');
		if(inputParam != null) {
			inputParam.value = valor;
		}
	}
}

function incrementaContadorMaior(doc,objId){
	var contadorMaior = doc.getElementById("contadorMaior"+objId);
	if(contadorMaior == null){
		var objRetorno = doc.getElementById(objId);
		contadorMaior = criaElemento(doc,'INPUT','hidden',"contadorMaior"+objId,"contadorMaior"+objId,1);
	    objRetorno.appendChild(contadorMaior);
	}else{
		var value = new Number(contadorMaior.getAttribute('value'));
		contadorMaior.setAttribute('value', value+1);
	}
}

function getContadorMaiorValue(doc,objId){
	var contadorMaior = doc.getElementById("contadorMaior"+objId);
	if(contadorMaior == null){
		var objRetorno = doc.getElementById(objId);
		contadorMaior = criaElemento(doc,'INPUT','hidden',"contadorMaior"+objId,"contadorMaior"+objId,'0');
	    if(objRetorno != null){
	    	objRetorno.appendChild(contadorMaior);
	    }
	    return 0;
	}else{
		var value = new Number(contadorMaior.getAttribute('value'));
		return value;
	}
}

function incrementaContadorSelecionados(doc,objId){
	alteraValorContadorSelecionados(1,doc,objId);
	incrementaContadorMaior(doc,objId);
}

function decrementaContadorSelecionados(doc,objId){
	alteraValorContadorSelecionados(-1,doc,objId);
}

function getContadorValue(doc,objId){
	var contador = doc.getElementById("contador"+objId);
	if(contador == null){
		var objRetorno = doc.getElementById(objId);
		contador = criaElemento(doc,'INPUT','hidden',"contador"+objId,"contador"+objId,'0');
	    if(objRetorno != null){
	    	objRetorno.appendChild(contador);
	    }
	    return 0;
	}else{
		var value = new Number(contador.getAttribute('value'));
		return value;
	}
}

function ehChave(td){
	if(td.nodeName == 'TD'){
		return td.getAttribute('pk') == 'true';
	}
	return false;
}

function ehChaveCandidata(property){
	if(property == null){
		return false;
	}
	var chave = document.getElementById("nomeClassePK").value;
	return (property.indexOf(chave+".") != -1);
}

function IS_isMultiplaSelecao(inputSelect){
	return inputSelect.getAttribute('multiplaSelecao')=='true';
}

/* Funcao chamada pela pagina de consuta
	para marcar os registros se estes ja tiverem sido
	marcados */
function checaRegistros(){
	var is = parent.document.getElementById(idObjRetorno);
	if(IS_isMultiplaSelecao(is)){
		var count = getContadorValue(document,'');
		var contadorFor = 0;
		for(var i = 0; true; i++){
			linha = document.getElementById('linha_'+i);
			if(linha == null){
				break;
			}
			tds = linha.childNodes;
			for(var j = 0; j < tds.length; j++){
				var chave = IS_getChaveRegistro(tds);
				var divName = IS_createMultSelecaoDivId(idObjRetorno,chave);
				var inputParamValue = IS_getInputParamValue(document,idObjRetorno);
				if(inputParamValue != null){//alert(inputParamValue + " - "+ "DivID="+divName+"^");
					if(inputParamValue.indexOf("DivID="+divName+"^") != -1){
						linha.getElementsByTagName('INPUT')[0].checked = true;
						contadorFor++;
						break;
					}
				}
			}
			if(contadorFor == count){
				return;
			}
		}
	}
}

function IS_definirPadraoAjaxRequest(button, servletUrl){
	var params = document.getElementById(idObjRetorno+'SelectedEntitiesList').value;
	params = url_encode(params);
	params = "component=multSelDefinirPadrao&isId="+idObjRetorno+"&params="+params;
	if (window.XMLHttpRequest) {
		reqrow = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		reqrow = new ActiveXObject("Microsoft.XMLHTTP");
	}
	reqrow.open("POST", servletUrl, true);
	reqrow.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    reqrow.setRequestHeader("Content-length", params.length);
    reqrow.setRequestHeader("Connection", "close");
	reqrow.onreadystatechange = IS_definirPadraoAjaxResponse;
	reqrow.send(params);

}

function IS_definirPadraoAjaxResponse(){
	if (reqrow.readyState == 4) {
		if (reqrow.status == 200) {
			alert(msgKey("label.js.padraoSalvo",""));
		}
	}
}

function IS_getDivTemp(doc,objId){
	var divTemp = doc.getElementById(objId+"MultSelTempDiv");
	if(divTemp == null){
		divTemp = criaDivDeInputs(doc,objId+"MultSelTempDiv");
		doc.getElementsByTagName("FORM")[0].appendChild(divTemp);
	}
	return divTemp;
}

function IS_delDivTemp(doc,objId){
	IS_salvaDivTemp(doc,objId,'');
}

function IS_salvaDivTemp(doc,objId,conteudo){
	if(isSearchFilterValid()){
		var divTemp = IS_getDivTemp(doc,objId);
		divTemp.innerHTML = conteudo;
	}else{
		return;
	}
}

function isSearchFilterValid(){
	return true;
}

function IS_getConteudoDivTemp(doc,objId){
	var divTemp = IS_getDivTemp(doc,objId);
	return divTemp.innerHTML;
}


//**********************//
//*** M�todos da Tag ***//
//**********************//

var _req;
var _tagId;
var _property;
var _inputSelectId;
var _url;
var _multiplaSelecao;
var _titulo;
var _altura;
var _largura;
var _bindings;
var _value;
var _isBtConsultar;
var _focusObject;
var _eventSrc;
var _idIframe;
var _desabilitarSelecionados;
var _carregaFilho;

IS_enableSubmit = true;

function getFiltroAsParameters(filtroValue){
	var parans = new String(filtroValue).split(";");
	var size = parans.length;
	var str = "";
	for(var i = 0; i < size; i++){
		if(i>0){
			str = str + "&"
		}
		str = str + parans[i];
	}
	return str;
}

function IS_request(inputSelectId, servletUrl, tagId, property, value, ctxPath, url, multiplaSelecao, titulo, altura, largura, bindings, isBtConsultar, event, requestSrc, idIframe, desabilitarSelecionados ){
	_tagId = tagId;
	_property = property;
	_inputSelectId = inputSelectId;
	_url = url;
	_multiplaSelecao = multiplaSelecao;
	_titulo = titulo;
	_altura = altura;
	_largura = largura;
	_bindings = bindings;
	_value = url_encode(value);
	_isBtConsultar = isBtConsultar;
	_idIframe = idIframe;
	_desabilitarSelecionados = desabilitarSelecionados;

	if (event != null) {
		if (F_isIExplorer()) {
			_eventSrc = event.srcElement;
		}else{
			_eventSrc = event.target;
		}
	} else {
		_eventSrc = null;
	}
	//Adicionado para resolver o problema de caracteres especiais
	value = url_encode(value);
	var tag = IS_getInputFromInputSelect(tagId, property);
	var is = document.getElementById(tagId);
	var prefix = replaceAll(property,'.','_');
	var nomeCamposArray = eval(tagId + "NomeCamposArray");
	if( value == '' && isBtConsultar != "true" && _eventSrc != null) {
		limparInputSelect(tagId);
   		setOldValueInputSelect(tagId);
		desabilitaInputsFilhos(document.getElementById(tagId),document);
 	 	if(IS_isMultiplaSelecao(document.getElementById(tagId))){
 	 		IS_onChangeMultSelecao(tag);
 	 	}
		return;
	}

	is.arrayCampos = nomeCamposArray;
	var antigoValor = tag.getAttribute('oldValue');

	if(isBtConsultar == "true" || antigoValor != tag.value || _eventSrc == null){
		optParams = complementInputSelectRequestParameters( tagId );
	   	if( optParams != null && optParams != '' ) {
       	    optParams = '&' + optParams;
        }
        var filtroValue = '';

        var filtroPai = is.getAttribute('filtroPai');
        var idPai = is.getAttribute('idPai');
        if(idPai != null &&  filtroPai != null){
			filtroValue = getFilterValue(is,document,';');
        }
        var filtroProperty = '';
        if(isBtConsultar == "false" || isBtConsultar == false){
        	filtroProperty = '&property='+ getOriginalBindingRefNameOf(tagId,nomeCamposArray,property)+'&value='+value;
        }
		var filtroAsParameter = getFiltroAsParameters(filtroValue);
        if(filtroAsParameter != ""){
        	filtroAsParameter = filtroAsParameter + "&";
        }
		var url = ctxPath + servletUrl + '?' + filtroAsParameter +
			'tagId='+ inputSelectId +filtroProperty+optParams+
			'&filtroValue='+filtroValue+'&component=inputSelect'+bindings+
			'&useAction='+is.getAttribute('useAction')+
			'&SpwInputSelectRequestOrigin='+requestSrc;

		if(document.getElementById("spwConsulta") != null && verificaIframeDiv()) {
			return;
		}

		if (window.XMLHttpRequest) {
			_req = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			_req = new ActiveXObject("Microsoft.XMLHTTP");
		}

		var currentTime = new Date().getTime();
        url += "&currentTime=" + currentTime;

		_req.open("GET", url, true);
		_req.onreadystatechange = IS_response;
		IS_enableSubmit = false;
		_req.send(null);

	}
	return;
}

function url_encode(str) {
	var retorno = new String("");
	var length = str.length;
	for(var index = 0; index < length; index++) {
		var chr = str.charAt(index);
		if(chr == '@' || chr == '*' || chr == '/' || chr == '+') {
			retorno = retorno.concat(encodeURIComponent(chr));
		} else {
			retorno = retorno.concat(escape(chr));
		}
	}
	return retorno;
}

function url_decode(str) {
	try {
		return unescape(str);
	} catch (ex) {
		try {
			return decodeURIComponent(str);
		} catch (ex) {
			return str;
		}
	}

}

function IS_mostreResultado(reqAtual, entities, property, tagId) {
	var prefix = replaceAll(property,'.','_');
	var nomeCamposArray = eval(tagId + "NomeCamposArray");
	var cacheArray = new Array();
	var entityLen = entities.childNodes.length;
	var inputSelect = document.getElementById(tagId);
	if(entityLen == 1){
		entity = entities.childNodes[0];
		refsLen = entity.childNodes.length;
		for(j = 0; j < refsLen; j++){
			row = entity.childNodes[j];
			refName = row.getAttribute('n');
			refValue = row.getAttribute('v');
			var formProperty = row.getAttribute('fp');
			if(formProperty == "false"){
				var bindings = inputSelect.getAttribute('bindings');
				if(bindings == null || bindings == ''){
					refName = nomeCampoEquivalenteInputSelect(tagId,refName);
				} else {
					refName = null;
				}
			}
			var comp = IS_getInputFromInputSelect(tagId, refName);
			if(comp != null){
				comp.value = refValue;
			}
		}
		if(temFilho(inputSelect)){
			habilitaInputsFilhos(inputSelect,document);
		}
		if(IS_isMultiplaSelecao(inputSelect)){
			IS_onChangeMultSelecao(IS_getInputFromInputSelect(tagId, property));
		}
		depoisSelecionarRegistros(tagId);
	} else {
		IS_zeraContadorSelecionados(document,_tagId);
		IS_clearInputParamValue(document,_tagId);
   		abrirJanelaConsulta();
		desabilitaInputsFilhos(document.getElementById(_tagId), document);
		limparInputSelect(_tagId);
		if(IS_isMultiplaSelecao(inputSelect)){
			IS_desmarcaTudo(F_getElementByNameOrId(document,_property));
		}
	}
}

/*Possibilita que o usu�rio troque o nome da referencia \npara determinado campo do formularioem rela��o ao input-select.*/
function nomeCampoEquivalenteInputSelect( sender, refName ) {
    return refName;
}


/*Possibilita que o usu�rio troque o nome da referencia \npara determinado campo do formulario em rela��o � grid de consulta.*/
function nomeCampoEquivalenteForm( sender, refName ) {
    return refName;
}

/*
 * Metodo para carregar automaticamente um inputSelect
 * caso ele possua apenas um resultado.
 */
function carregaIS(tagId, isSelecionar) {
	var objIS = document.getElementById(tagId);
	var inputSelectId = objIS.getAttribute('input-select');
	var servletUrl = '/AjaxServlet.ajax';
	var tagId = objIS.getAttribute('id');
	var property = objIS.getAttribute('name');
	var value = '';
	var ctxPath = objIS.getAttribute('ctxPath');
	var url = objIS.getAttribute('url');
	var multiplaSelecao = objIS.getAttribute('multiplaselecao');
	var titulo = objIS.getAttribute('title');
	var altura = objIS.getAttribute('altura');
	var largura = objIS.getAttribute('largura');
	var bindings = objIS.getAttribute('bindings');
	var isBtConsultar = isSelecionar;
	if (isSelecionar == null) {
		var isBtConsultar = false;
	}
	var requestSrc;
	if (isSelecionar === true) {
		requestSrc = 'InputSelectSearchGrid';
	} else {
		requestSrc = 'InputSelectAutoComplete';
	}
	var idIframe = objIS.getAttribute('idiframe');
	var desabilitarSelecionados = objIS.getAttribute('desabilitarselecionados');
	var tag = IS_getInputFromInputSelect(tagId, property);
	_carregaFilho = true;
	IS_request(inputSelectId, servletUrl, tagId, property, value, ctxPath, url, multiplaSelecao, titulo, altura, largura, bindings, isBtConsultar, null, requestSrc, idIframe, desabilitarSelecionados);
}

/*
 * M�todo para carregar o resultado do inputSelect
 * filho caso ele possua apenas um resultado.
 */
function carregaISFilho(tagId, isSelecionar) {
	var is;
	var filhos;
	is = document.getElementById(tagId);
	if (is.getAttribute('carregaFilho') === "true") {
		filhos = getInputsSelectFilhos(is);
		var filho = filhos[0];
		var filhoId = filho.getAttribute('idFilho');
		carregaIS(filhoId, isSelecionar);
	} else {
		_carregaFilho = false;
	}
}

function IS_response() {
	if (_req.readyState == 4) {
		if (_req.status == 200) {
			if (!exceptionTagPresent(_req)) {
				if (F_isIExplorer()) {
					_focusObject = document.activeElement;
				}
				refers = _req.responseXML.getElementsByTagName('rfs')[0];
				var nomeCamposArray = eval(_tagId + "NomeCamposArray");

				var hasMoreThanOne = moreThanOneElemTagPresent(_req);
				if (clearTagPresent(_req) && _isBtConsultar != "true") {
					limparInputSelect(_tagId);
					desabilitaInputsFilhos(document.getElementById(_tagId), document);
					try {
						document.getElementById(_property).focus();
					} catch (e) {}
					setOldValueInputSelect(_tagId);
					alert(IS_NoResultMessage(_tagId));
				}
				else
					if (hasMoreThanOne || _isBtConsultar === "true") {
						if (_isBtConsultar != "true") {
							trataConsultaSemResultado(_tagId, _property);
						}
						var is = document.getElementById(_tagId);
						var idPai = is.getAttribute('idPai');
						if (_carregaFilho != true) {
							abrirJanelaConsulta();
						}
					}
					else {
						IS_mostreResultado(_req, refers, _property, _tagId);
						setOldValueInputSelect(_tagId, nomeCamposArray);
					}
			}
		}
		IS_enableSubmit = true;
		var is = document.getElementById(_tagId);
		if (temFilho(is) && _isBtConsultar != "true" && !hasMoreThanOne) {
			carregaISFilho(_tagId, _isBtConsultar);
		} else {
			_carregaFilho = false;
		}
	}
}

function trataConsultaSemResultado(_tagId, _property) {
	IS_zeraContadorSelecionados(document, _tagId);
	IS_clearInputParamValue(document, _tagId);
	desabilitaInputsFilhos(document.getElementById(_tagId), document);
	limparInputSelect(_tagId);
	if (IS_isMultiplaSelecao(document.getElementById(_tagId))) {
		IS_desmarcaTudo(F_getElementByNameOrId(document, _property));
	}
}

function abrirJanelaConsulta(){
	var ie = F_isIExplorer();
	if(ie && _focusObject.nodeName != "INPUT") {
	   	_focusObject = IS_getObjectToFocus();
   	}else if(!ie && IS_clicouNaLupa()){
   		var focusObj = IS_getObjectToFocus();
   		if(focusObj != null){
   			focusObj.focus();
   		}
   	}
	var nomeCamposArray = eval(_tagId + "NomeCamposArray");
	if(_url.indexOf('?') > -1){
		paramSeparetor = '&';
	}else{
		paramSeparetor = '?';
	}
	abrirConsultaPorLink(this,_url + paramSeparetor +
		getOriginalBindingRefNameOf(_tagId,nomeCamposArray,_property)+'=' +
		_value+'&'+'reference='+_property+'&'+_property+'='+_value+
		'&'+getFilterValue(document.getElementById(_tagId),document,'&'),
		_largura,_altura,_titulo,_tagId,_multiplaSelecao,_inputSelectId, _bindings, _idIframe, _desabilitarSelecionados);
}

function IS_clicouNaLupa(){
	return (_eventSrc != null && _eventSrc.nodeName == "IMG");
}

function IS_getObjectToFocus(){
	var tdImagem = _eventSrc.parentNode;
	if(tdImagem == null){
		return null;
	}
	var td = jQuery(tdImagem).prev('td')[0];
	if(td == null){
		return null;
	}
	var input = td.getElementsByTagName('INPUT')[0];
	while(input == null || input.nodeName != "INPUT" || input.offsetHeight == 0 || input.disabled){
		td = jQuery(td).prev('td')[0];
		if(td == null){
			return null;
		}
		input = td.getElementsByTagName('INPUT')[0];
		if(td.nodeName != 'TD'){
			return null;
		}
	}
	return input;
}

function IS_registraFilho(idPai, idFilho){
	var isPai = document.getElementById(idPai);
	if(isPai!=null){
		var f = document.createElement('FILHO');
		f.setAttribute('idFilho',idFilho);
		isPai.appendChild(f);
		if(!isInputSelectFilled(isPai)){
			desabilitaInputSelect(document.getElementById(idFilho),document);
		}
	}
}

function IS_limparFilhos(inputSelectTableId_tmp) {
	// verifica se faz parte de uma rela��o pai e filho
	var inputSelectTable_tmp = jQuery('#' + inputSelectTableId_tmp);
	var inputSelectTablePaiId_tmp = inputSelectTable_tmp.attr("idpai");
	if (inputSelectTablePaiId_tmp != null && inputSelectTablePaiId_tmp != 'null') { // necess�ria verifica��o por string pois �s vezes o atributo existe com valor 'null'
		// se fizer, verifica se o pai est� preenchido para deixar o filho habilitado, ou, desabilitado caso contr�rio
		var inputSelectTablePai_tmp = jQuery('#' + inputSelectTablePaiId_tmp);
		var camposPai_tmp = inputSelectTablePai_tmp.find(':input[type="text"]:not(:hidden)');
		for (var index = 0; index < camposPai_tmp.length; index++) {
			if (camposPai_tmp[index].value != null && camposPai_tmp[index].value != "") {
				// armazena os valores dos campos do is-filho pois eles s�o limpos pelo habilitaInputsFilhos
				var camposFilho_tmp = inputSelectTable_tmp.find(':input[type="text"]');
				var camposFilho_tmpValues = new Array();
				for (var i=0; i < camposFilho_tmp.length; i++) {
					camposFilho_tmpValues[i] = camposFilho_tmp[i].value;
				}

				habilitaInputsFilhos(inputSelectTablePai_tmp.get()[0], document);

				// recupera os valores dos campos do is-filho para o estado anterior � limpeza pelo habilitaInputsFilhos
				for (var i=0; i < camposFilho_tmp.length; i++) {
					camposFilho_tmp[i].value = camposFilho_tmpValues[i];
				}
			} else {
				desabilitaInputsFilhos(inputSelectTablePai_tmp.get()[0], document);
			}
			break;
		}
	}
}
function setUser(user){
	document.getElementById('j_usernameCer').value = user;
}
function setPass(pass){
	document.getElementById('j_passwordCer').value = pass;
}
function submitLogin() {
	document.getElementById("formCertificado").submit();
}


function loginCertificado(b){
	if(b){
		document.getElementById("tdFormulario").style.display = 'none';
		document.getElementById("tdCertificado").style.display = '';
	} else {
		document.getElementById("tdCertificado").style.display = 'none';
		document.getElementById("tdFormulario").style.display = '';
	}

}
function LF_onSubmitFingerprint() {
	return document.getElementById('j_passwordFP') != null;
}
var timeMenu = null

//local: item do menu
//acao:espande ou contrai os filhos de um item do menu
function A_menuShowDesc(obj){
	var objJQuery = jQuery('#'+obj.id);
	var parent = objJQuery.parents('div.itemmenu')[0];
	var icone = jQuery('div#'+parent.id + ' img')[0];
	var divSubMenuJquery = jQuery('div#'+parent.id+ ' div.subMenu:first');
	var divSubMenu = divSubMenuJquery[0];
	var posBarra = icone.src.lastIndexOf("/");

	if(divSubMenu.style.display == "none"){
		divSubMenuJquery.fadeIn(200);
		icone.src = icone.src.substr(0, posBarra) + "/icoMenos.gif";
	}else{
		divSubMenuJquery.fadeOut(200);
		icone.src = icone.src.substr(0, posBarra) + "/icoMais.gif";
	}
}

//local: layer com lista de modulos
//acao: troca para o modulo selecionado
function A_menuShowModulo(modulo){

	var laModulo = document.getElementById("modulo_" + modulo);

	jQuery("div[id^=modulo_]").hide();

	jQuery(laModulo).fadeIn(200);

	var laMenu = document.getElementById("layerMenus");
	laMenu.style.visibility = "hidden";

	var objTextModulo = document.getElementById("textModulo");
	objTextModulo.childNodes[0].nodeValue = modulo;
}

//local:layer de lista de modulos
//acao:mostra o layer
function A_menuShowLayer(obj){

	var laMenu = document.getElementById("layerMenus");
	if(laMenu.style.visibility == "visible"){
		laMenu.style.visibility = "hidden";
	}else{
		jQuery(laMenu).slideDown(150);
		laMenu.style.visibility = "visible";
	}

	if(obj != null){
		widthMenu = obj.offsetWidth;
		laMenu.style.width = widthMenu;
	}

}

//local:layer de lista de modulos
//acao:mostra o layer
function A_menuMaintainLayer(obj){
	clearTimeout(timeMenu)
}

//local:layer de lista de modulos
//acao:esconde o layer
function A_menuHiddenLayer(origem){

	if(origem == "funcao"){
		laMenu = document.getElementById("layerMenus")
		laMenu.style.visibility = "hidden"
	}else{
		timeMenu = setTimeout("A_menuHiddenLayer('funcao')", 500)
	}
}

function acertaScrollMenu(){
	var tdScroll = document.getElementById('tdScrollMenu');
	var divScroll = document.getElementById('scrollMenu');
	divScroll.style.display = 'none';
	divScroll.style.height = tdScroll.offsetHeight + "px";
	divScroll.style.overflow = 'auto';
	divScroll.style.display = '';

	var tdScrollMeuMenu = document.getElementById('tdScrollMeuMenu');
	var divScrollMeuMenu = document.getElementById('scrollMeuMenu');
	divScrollMeuMenu.style.display = 'none';
	divScrollMeuMenu.style.height = tdScrollMeuMenu.offsetHeight + "px";
	divScrollMeuMenu.style.overflow = 'auto';
	divScrollMeuMenu.style.display = '';

	var tdScrollWorkflow = document.getElementById('tdScrollWorkflow');
	var divScrollWorkflow = document.getElementById('scrollWorkflow');
	if(divScrollWorkflow) {
		divScrollWorkflow.style.display = 'none';
		divScrollWorkflow.style.height = tdScrollWorkflow.offsetHeight + "px";
		divScrollWorkflow.style.overflow = 'auto';
		divScrollWorkflow.style.display = '';
	}
}

//local:caixa de menu e meu menu
//acao:esconde e mostra conteudo
function A_expand(tipo){
	objMenu = document.getElementById("menu");
	objMeuMenu = document.getElementById("meuMenu");
	objWorkflow = document.getElementById("workflow")

	objTrMenu = document.getElementById("trMenu");
	objTrMeuMenu = document.getElementById("trMeuMenu");
	objTrWorkflow = document.getElementById("trWorkflowMenu");
	var wf = false;
	if(objTrWorkflow){
		wf = true;
	}
	objTrVazio = document.getElementById("trVazia");

	objScroll = document.getElementById("scrollMenu");
	objTdScroll = document.getElementById("tdScrollMenu");

	if(tipo == "menu"){
		if(objTrMenu.style.display == "none"){
			objTrMeuMenu.style.display = "none";
			jQuery(objTrMenu).fadeIn(200);


			objTrVazio.style.display = "none";
			objMenu.className = "caixaMenu-ativada";
			objMeuMenu.className = "caixaMenu";

			if(wf){
				objTrWorkflow.style.display = "none";
				objWorkflow.className = "caixaMenu";
			}

			objScroll.style.height = objTdScroll.offsetHeight + "px";
			objScroll.style.overflow = "auto";
		}else{
			objMenu.className = "caixaMenu";
			objMeuMenu.className = "caixaMenu";

			jQuery(objTrMenu).fadeOut(200);
			objTrMeuMenu.style.display = "none";

			if(wf){
				objWorkflow.className = "caixaMenu";
				objTrWorkflow.style.display = "none";
			}

			objTrVazio.style.display = "";
		}

	}else if(tipo == "meuMenu"){
		if(objTrMeuMenu.style.display == "none"){
			jQuery(objTrMeuMenu).fadeIn(200);
			objTrMenu.style.display = "none";

			objTrVazio.style.display = "none";

			objMenu.className = "caixaMenu";
			objMeuMenu.className = "caixaMenu-ativada";
			if(wf){
				objTrWorkflow.style.display = "none";
				objWorkflow.className = "caixaMenu";
			}
		}else{
			objMenu.className = "caixaMenu";
			objMeuMenu.className = "caixaMenu";

			jQuery(objTrMeuMenu).fadeOut(200);

			if(wf){
				objWorkflow.className = "caixaMenu";
				objTrWorkflow.style.display = "none";
			}
			objTrMenu.style.display = "none";
			objTrVazio.style.display = "";
		}
	}else if(tipo == "workflowMenu"){
		if(objTrWorkflow.style.display == "none"){

			objTrMeuMenu.style.display = "none";
			objTrMenu.style.display = "none";
			objTrVazio.style.display = "none";

			objMenu.className = "caixaMenu";
			objMeuMenu.className = "caixaMenu";

			if(wf){
				objWorkflow.className = "caixaMenu-ativada";
				jQuery(objTrWorkflow).fadeIn(200);
			}
		}else{
			objMenu.className = "caixaMenu";
			objMeuMenu.className = "caixaMenu";
			if(wf){
				objWorkflow.className = "caixaMenu";
				jQuery(objTrWorkflow).fadeOut(200);
			}

			objTrMeuMenu.style.display = "none";
			objTrMenu.style.display = "none";
			objTrVazio.style.display = "";
		}
	}
	acertaScrollMenu();
}

//local:icone do menu
//acao:abre todas as opcoes do menu do modulo atual
function A_openAllMenu(){
	var modulo = jQuery("#textModulo")[0].childNodes[0].nodeValue;
	var objDivModulo = document.getElementById("modulo_" + modulo);

	var objDivModuloJQ = jQuery(objDivModulo);
	objDivModuloJQ.find("div.subMenu").fadeIn(200);

	var aImgs = objDivModulo.getElementsByTagName("IMG");
	var length = aImgs.length;
	for(i = 0; i < length; i++){
		if(aImgs[i].src.indexOf("icoMais") != -1){
			posBarra = aImgs[i].src.lastIndexOf("/")
			aImgs[i].src = aImgs[i].src.substr(0, posBarra) + "/icoMenos.gif"
		}
	}
}

//local:icone do menu
//acao:fecha todas as opcoes do menu do modulo atual
function A_closeAllMenu(){
	var modulo = jQuery("#textModulo")[0].childNodes[0].nodeValue;
	var objDivModulo = document.getElementById("modulo_" + modulo);

	var objDivModuloJQ = jQuery(objDivModulo);
	objDivModuloJQ.find("div.subMenu").fadeOut(200);

	var aImgs = objDivModulo.getElementsByTagName("IMG");
	var length = aImgs.length;
	for(i = 0; i < length; i++){
		if(aImgs[i].src.indexOf("icoMenos") != -1){
			posBarra = aImgs[i].src.lastIndexOf("/")
			aImgs[i].src = aImgs[i].src.substr(0, posBarra) + "/icoMais.gif"
		}
	}

}

function A_highModulo(obj){
	obj.className = "moduloOption-o"
}

function A_lowModulo(obj){
	obj.className = "moduloOption"
}

function MENU_MOver(obj){
	if(obj.className != "caixaMenu-ativada"){
		obj.className = obj.className + "-o";
	}
}

function MENU_MOut(obj){
	if(obj.className != "caixaMenu-ativada" && FS_endsWith(obj.className, "-o")){
		obj.className = obj.className.substring(0,obj.className.indexOf('-o'));
	}
}




function MW_criaMenu(raiz, tabelaPrincipal) {
  	var $itemSelecionado = MW_clearMenu(tabelaPrincipal);
  	var itens = raiz.childNodes;
  	var $tabelaPrincipal = jQuery(tabelaPrincipal);
	jQuery(itens).each(function(i) {
		var $primeiroDiv = newDiv();
		$tabelaPrincipal.append($primeiroDiv);
		criaItensRecursivo(itens[i],1,$primeiroDiv);
	});
}

function criaItensRecursivo (item, nivel, divPai) {
	var quantidade = getQuantidade(item);
	var valor = getValor(item);
	if(quantidade != ''){
		valor += ' (' + quantidade + ') ';
	}
  	if(this.ehFolha(item)){
  		var table = criaTableFolha(valor, getLink(item), nivel);
		divPai.append(table);
  	} else {
  		var table = criaTableNaoFolha(valor, nivel);
		var novoDiv;
		if(nivel == 1){
			var novoDivRoot = newDiv();
			novoDivRoot.attr('id', 'rootDiv_'+valor);
			novoDivRoot.append(table);
			novoDiv = newDiv();
			novoDivRoot.append(novoDiv);
			divPai.append(novoDivRoot);
		} else {
			divPai.append(table);
			novoDiv = newDiv();
			divPai.append(novoDiv);
		}
		var filhos = item.childNodes;
		for(var j = 0; j < filhos.length; j++){
			criaItensRecursivo(filhos[j], nivel+1, novoDiv);
		}
	}
}

function getValor (item) {
	return item.getAttribute('Valor');
}

function getQuantidade (item) {
	return item.getAttribute('Qtd');
}

function ehFolha (item) {
	return (item.childNodes.length < 1);
}

function criaTableFolha (valor, link, nivel) {
	var $table = newTable('100%', '0', '0', '0');
  	var $tbody = jQuery('<tbody>');
  	var $tr = newTr();
  	var $td = newTd(15*(nivel-1)+1, '', '', '');
  	var $td2 = newTd('10', '', 'menuText', '');
  	var $td3 = newTd('', '18', 'menuText', '');

  	$table.append($tbody);
  	$tbody.append($tr);
  	$tr.append($td);
  	$tr.append($td2);
  	$td2.append(newImageIcone());
  	$tr.append($td3);
  	$td3.append(newLinkMenu(valor, link));
  	return $table;
}

function criaTableNaoFolha (valor, nivel) {
	var $table = newTable('100%', '0', '0', '0');
  	var $tbody = jQuery('<tbody>');
  	var $tr = newTr();
  	var $td = newTd(15*(nivel-1)+1, '', '', '');
  	var $td2 = newTd('12', '', 'menuText', '');
  	var $td3 = newTd('', '18', 'menuTextPrinc', '');

  	$table.append($tbody);
  	$tbody.append($tr);
  	$tr.append($td);
  	$tr.append($td2);
  	$td2.append(newImageMais());
  	$tr.append($td3);
  	$td3.append(newLinkMais(valor));

  	return $table;
}

function newDiv () {
	var $div = jQuery('<div>');
  	return $div;
}

function newTable (width, border, cellspacing, cellpadding) {
  	var $table = jQuery('<table>');
	if(width != ""){$table.attr('width', width);}
	if(border != ""){$table.attr('border',border);}
	if(cellspacing != ""){$table.attr('cellSpacing', cellspacing);}
	if(cellspacing != ""){$table.attr('cellPadding', cellpadding);}
	return $table;
}

function newTr () {
	var $tr = jQuery('<tr>');
	return $tr;
}

function newTd (width, height, className, conteudo) {
	var $td = jQuery('<td>');
	if(width != ''){$td.attr('width', width);}
	if(height != ''){$td.attr('height', height);}
	$td.attr('className', className);
	$td.append(conteudo);
	return $td;
}

function newImageIcone () {
	var $img = jQuery('<img>');
	$img.attr('src', tema+'/imagens/spw/icoBola.gif');
	$img.attr('width', '9');
	$img.attr('height', '11');
	return $img;
}

function newLinkMenu (valor, link) {
	var $a = jQuery('<a>');
  	$a.click(function () {
		MENU_ClickItemMenu(this,true, 0);
	});
  	$a.attr('target', 'page');
  	$a.attr('href', link);
  	$a.append(valor);
	return $a;
}

function newImageMais () {
	var $img = jQuery('<img>');
  	$img.attr('src', tema+'/imagens/spw/icoMenos.gif');
  	$img.attr('width', '9');
  	$img.attr('heigth', '11');
	$img.click(MW_menuShowDesc);
  	$img.css('cursor', 'pointer');
  	return $img;
}

function newLinkMais (valor) {
	var $a = jQuery('<a>');
  	$a.click(MW_menuShowDesc);
  	$a.css('cursor', 'pointer');
  	$a.append(valor);
	return $a;
}

function MW_clearMenu (tabelaPrincipal) {
	var filhos = tabelaPrincipal.childNodes;
	var nuFilhos = filhos.length;
	for(var i = 0; i < nuFilhos; i++){
		tabelaPrincipal.removeChild(filhos[0]);
	}
	return ""
}

function getLink (item){
	return jQuery(item).attr('Link');
}

function menuWFShowLayer(obj){
	var $laMenu = jQuery('layerRoots');
	if($laMenu.css('visibility') == 'visible'){
		$laMenu.css('visibility', 'hidden');
	}else{
		$laMenu.css('visibility', 'visible');
	}

	if(obj != null){
		var $widthMenu = jQuery(obj).width();
		$laMenu.css('width', $widthMenu);
	}
}

function MW_menuShowDesc () {
	var $obj;
	if(jQuery.browser.msie){
		$obj = jQuery(event.srcElement);
	}else{
		$obj = jQuery(this);
	}

	var $tableMenu = $obj;
	while($tableMenu.get(0).nodeName != 'TABLE'){
		$tableMenu = $tableMenu.parent();
	}

	var $tdsTable = $tableMenu.find('td');
	var $objIco = $tdsTable.get(1).childNodes[0];
	var i = 0;
	while(i < $tdsTable.get(1).childNodes.length && $tdsTable.get(1).childNodes[i].nodeName != 'IMG'){
		i++;
		$objIco = tdsTable.get(1).childNodes[i];
	}
	var posBarra = $objIco.src.lastIndexOf("/");


	var $objDiv = $tableMenu
	while($objDiv.get(0).nodeName != 'DIV'){
		$objDiv = $objDiv.next();
	}

	if($objDiv.css('display') == 'none'){
		$objDiv.css('display', '');
		$objIco.src = $objIco.src.substr(0, posBarra) + '/icoMenos.gif';
	}else{
		$objDiv.css('display', 'none');
		$objIco.src = $objIco.src.substr(0, posBarra) + '/icoMais.gif';
	}
}var objRow;

function getParentNode(obj){
	objRow = obj;
	while(objRow.nodeName != 'TR'){
		objRow = objRow.parentNode;
	}
	objTable = document.getElementById('tabelaMeumenu');
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == 'radio' && arrayInput[i].checked && arrayInput[i]!=obj){
			arrayInput[i].checked = false;
		}
	}
}

function paraCima(idTable){
	objTable = document.getElementById(idTable);
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == 'radio' && arrayInput[i].checked){
			inputSel = arrayInput[i];
		}
	}
	if(inputSel == null){
		alert(msgKey("label.js.itemOrdenacao"));
	}else{
		objRow = inputSel;
		while(objRow.nodeName != 'TR'){
			objRow = objRow.parentNode;
		}

		objRowAnterior = objRow.previousSibling;
		if(objRowAnterior != null){
			while(objRowAnterior.nodeName != 'TR' || objRowAnterior == null ){
				objRowAnterior = objRowAnterior.previousSibling;
			}

			if(objRowAnterior.style.display != "none"){
				objTable.lastChild.insertBefore(objRow, objRowAnterior);
				inputSel.checked = true;
			}
		}
	}
	setOrdem(idTable);

}

function paraBaixo(idTable){
	objTable = document.getElementById(idTable);
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == 'radio' && arrayInput[i].checked){
			inputSel = arrayInput[i];
		}
	}
	if(inputSel == null){
		alert(msgKey("label.js.itemOrdenacao"));
	}else{
		objRow = inputSel;
		while(objRow.nodeName != 'TR'){
			objRow = objRow.parentNode;
		}

		objRowNext = objRow.nextSibling;
		if(objRowNext != null){
			while(objRowNext.nodeName != 'TR' || objRowNext.nodeName == null ){
				objRowNext = objRowNext.nextSibling;
			}
			if(objRowNext.id != "trWidthBaseMeumenu"){
				objTable.lastChild.insertBefore(objRowNext, objRow);
			}
		}
	}
	setOrdem(idTable);
}

function paraTopo(idTable){
	objTable = document.getElementById(idTable);
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == 'radio' && arrayInput[i].checked){
			inputSel = arrayInput[i];
		}
	}
	if(inputSel == null){
		alert(msgKey("label.js.itemOrdenacao"));
	}else{
		objRow = inputSel;
		while(objRow.nodeName != 'TR'){
			objRow = objRow.parentNode;
		}

		objRowPrimeiro = objTable.getElementsByTagName('TR')[1];
		objTable.lastChild.insertBefore(objRow, objRowPrimeiro);
		inputSel.checked = true;
	}
	setOrdem(idTable);
}

function paraFundo(idTable){
	objTable = document.getElementById(idTable);
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == 'radio' && arrayInput[i].checked){
			inputSel = arrayInput[i];
		}
	}
	if(inputSel == null){
		alert(msgKey("label.js.itemOrdenacao"));
	}else{
		objRow = inputSel;
		while(objRow.nodeName != 'TR'){
			objRow = objRow.parentNode;
		}
		arrayTR = objTable.getElementsByTagName('TR')
		objRowUltimo = arrayTR[arrayTR.length - 1];
		objTable.lastChild.insertBefore(objRow, objRowUltimo);
		inputSel.checked = true;
	}
	setOrdem(idTable);
}

function setOrdem(idTable){
	objTable = document.getElementById(idTable);
	arrayInput = objTable.getElementsByTagName('INPUT');
	inputSel = null;
	j = 0;
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].name.indexOf('nuOrdem') != -1){
			arrayInput[i].value = j++;
		}
	}
	//coloca fundo na linha selecionada
	radioSel = null
	for(i = 0; i < arrayInput.length; i++){
		if(arrayInput[i].type == "radio"){
			if(arrayInput[i].checked){
				radioSel = arrayInput[i]
			}
		}
	}
	if(radioSel != null){
		//CGRID_FCS(radioSel)
		radioSel.focus()
	}

}
// based on code written by Tan Ling Wee on 2 Dec 2001
// last updated 20 June 2003
// email : fuushikaden@yahoo.com
//
// Modified to be completely object-oriented, CSS based and using proper DOM-access functions
// @author Martin Marinschek
// @author Sylvain Vieujot

org_apache_myfaces_CalendarInitData = function()
{
 this.fixedX = -1;
 // x position (-1 if to appear below control)
 this.fixedY = -1;
 // y position (-1 if to appear below control)
 this.startAt = 0;
 // 0 - sunday ; 1 - monday
 this.showWeekNumber = 1;
 // 0 - don't show; 1 - show
 this.showToday = 1;
 // 0 - don't show; 1 - show
 this.imgDir = "images/";
 // directory for images ... e.g. this.imgDir="/img/"
 this.themePrefix = "jscalendar-DB";
 // columns width
 this.columnsWidth = 26;

 this.gotoString = "Go To Current Month";
 this.todayString = "Today is";
 this.todayDateFormat = null;
 this.weekString = "Wk";
 this.scrollLeftMessage = "Click to scroll to previous month. Hold mouse button to scroll automatically.";
 this.scrollRightMessage = "Click to scroll to next month. Hold mouse button to scroll automatically."
 this.selectMonthMessage = "Click to select a month."
 this.selectYearMessage = "Click to select a year."
 this.selectDateMessage = "Select [date] as date." // do not replace [date], it will be replaced by date.

 this.popupLeft=false;

 this.monthName = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
 this.dayName = this.startAt == 0 ? new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat") : new Array("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
}

org_apache_myfaces_DateParts = function(sec, min, hour, date, month, year)
{
 this.sec = sec;
 this.min = min;
 this.hour = hour;
 this.date = date;
 this.month = month;
 this.year = year;
}

org_apache_myfaces_HolidayRec = function(d, m, y, desc)
{
 this.d = d;
 this.m = m;
 this.y = y;
 this.desc = desc;
}

org_apache_myfaces_PopupCalendar = function()
{
 this.inited = false;
 this.idPrefix = "org_apache_myfaces_PopupCalendar";

 this.selectedDate = new org_apache_myfaces_DateParts(0, 0, 0, 0, 0, 0);
 this.saveSelectedDate = new org_apache_myfaces_DateParts(0, 0, 0, 0, 0, 0);

 this.monthConstructed = false;
 this.yearConstructed = false;
 this.intervalID1;
 this.intervalID2;
 this.timeoutID1;
 this.timeoutID2;
 this.ctlToPlaceValue;
 this.ctlNow;
 this.containerCtl;
 this.dateFormat="MM/dd/yyyy";
 this.nStartingYear;
 this.bPageLoaded = false;
 this.ie = document.all;
 this.dom = document.getElementById;
 this.ns4 = document.layers;
 this.dateFormatSymbols = new org_apache_myfaces_DateFormatSymbols();
 this.initData = new org_apache_myfaces_CalendarInitData();
 this.today = new Date();
 this.dateNow = this.today.getDate();
 this.monthNow = this.today.getMonth();
 this.yearNow = this.today.getYear();
 this.imgSrc = new Array("spwCalendarDrop1.gif", "spwCalendarDrop2.gif", "spwCalendarLeft1.gif", "spwCalendarLeft2.gif", "spwCalendarRight1.gif", "spwCalendarRight2.gif");
 this.img = new Array();

 //elements which need to change their dynamical
 //representation over time
 this.calendarDiv;
 this.selectMonthDiv;
 this.selectYearDiv;
 this.todaySpan = null;
 this.captionSpan = null;
 this.contentSpan = null;
 this.closeCalendarSpan = null;
 this.monthSpan = null;
 this.yearSpan = null
 this.changeMonthImg = null;
 this.changeYearImg = null;

 this.holidaysCounter = 0;
 this.holidays = new Array();

 this.bClickOnCalendar = false;
 this.bCalendarHidden = true;

 this.myFacesCtlType = "x:inputCalendar";
 this.inputDateClientId;

 var topLevelTable;
 var tdDate;
 var tdSchedule;
 var tdFooter;
 var tdButton;
 var scheduleTable;
 var folderTabs;
 var folderTabsRow;
 var tabMouseOver;
 var tabMouseOut;
 var currentTab;
 var comboMonthYearRow;
 var closeCalendarLink;
 var closeButtonCell;
 var closeFolderCell;

 this.txtSchedule_1 = "Dia da gera��o do relat�rio";
 this.txtSchedule_2_1 = "Dia";
 this.txtSchedule_2_2 = "do m�s";
 this.txtSchedule_3 = "�ltimo dia do m�s";
 this.txtSchedule_4 = "dia(s)";
 this.txtSchedule_5 = "semana(s)";
 this.txtSchedule_6 = "mes(es)";

 this.inputSchedule;
}

org_apache_myfaces_PopupCalendar.prototype._hideElement = function(overDiv)
{

 if (document.all)
 {
 var iframe = document.getElementById(overDiv.id + "_IFRAME");

 if (iframe == null)
 {
 // the source attribute is to avoid a IE error message about non secure content on https connections
 iframe = document.createElement("<iframe src='javascript:false;' id='" + overDiv.id + "_IFRAME' style='visibility:hidden; position: absolute; top:0px;left:0px;'/>");
 this.containerCtl.appendChild(iframe);
 }

 this._recalculateElement(overDiv);
 }
}

org_apache_myfaces_PopupCalendar.prototype._recalculateElement = function(overDiv)
{

 if (document.all)
 {
 var iframe = document.getElementById(overDiv.id + "_IFRAME");

 if (iframe)
 {
 var popup = overDiv;

 popup.style.zIndex = 98;

 iframe.style.zIndex = popup.style.zIndex - 1;
 iframe.style.width = popup.offsetWidth;
 iframe.style.height = popup.offsetHeight;
 iframe.style.top = popup.style.top;
 iframe.style.left = popup.style.left;
 iframe.style.display = "block";
 iframe.style.visibility = "visible";
 /*we have to set an explicit visible otherwise it wont work*/
 }
 }
}

org_apache_myfaces_PopupCalendar.prototype._showElement = function(overDiv)
{

 var iframe = document.getElementById(overDiv.id + "_IFRAME");

 if (document.all && iframe)
 {
 iframe.style.display = "none";
 }
}

org_apache_myfaces_PopupCalendar.prototype.addHoliday = function(d, m, y, desc)
{
 this.holidays[this.holidaysCounter++] = new org_apache_myfaces_HolidayRec (d, m, y, desc);
}

org_apache_myfaces_PopupCalendar.prototype._swapImage = function(srcImg, destImg)
{

 if (srcImg)
 srcImg.setAttribute("src", this.initData.imgDir + destImg);
}

org_apache_myfaces_PopupCalendar.prototype._keypresshandler = function()
{
 try
 {
 if (event && event.keyCode == 27)
 this._hideCalendar();
 }
 catch(ex)
 {
 }
}

org_apache_myfaces_PopupCalendar.prototype._clickhandler = function()
{
 if (!this.bClickOnCalendar)
 {
 this._hideCalendar();
 }

 this.bClickOnCalendar = false;
}

org_apache_myfaces_PopupCalendar.prototype._getTdScheduleStyle = function(showSchedule){
	//return ("border:0px; border-left:1px solid #A0A0A0; background-color:#FFFFFF;" +
	return ("border:0px; background-color:#FFFFFF;" +
		(showSchedule ? "" : " display:none;"));
}

org_apache_myfaces_PopupCalendar.prototype.selectSheduleOption = function(){
	if(!this.ctlToPlaceValue.readOnly){
		this.ctlToPlaceValue.previusClassName = this.ctlToPlaceValue.className;
		this.ctlToPlaceValue.className = "disabled";
		this.ctlToPlaceValue.readOnly = true;
	}
	var startChar;
	if($("tpSchedule_1").checked) {
		this.ctlToPlaceValue.value = this.txtSchedule_1;
		this.inputSchedule.value = "1";
	}else
		if($("tpSchedule_2").checked) {
			this.ctlToPlaceValue.value = this.txtSchedule_2_1 + " " + $("nuNumSchedule_2").value + " " + this.txtSchedule_2_2;
			this.inputSchedule.value = "2;" + $("nuNumSchedule_2").value;
	}else
		if($("tpSchedule_3").checked) {
			this.ctlToPlaceValue.value = this.txtSchedule_3;
			this.inputSchedule.value = "3";
	}else
		if($("tpSchedule_4").checked) {
			this.ctlToPlaceValue.value = $("nuNumSchedule_4").value + " " + this.txtSchedule_4 + " " + $("nuNumScheduleDir_4").value;
			startChar = new String($("nuNumScheduleDir_4").value).charAt(0);
			this.inputSchedule.value = "4;" + $("nuNumSchedule_4").value + ";" + startChar;
	}else
		if($("tpSchedule_5").checked) {
			this.ctlToPlaceValue.value = $("nuNumSchedule_5").value + " " + this.txtSchedule_5 + " " + $("nuNumScheduleDir_5").value;
			startChar = new String($("nuNumScheduleDir_5").value).charAt(0);
			this.inputSchedule.value = "5;" + $("nuNumSchedule_5").value + ";" + startChar;
	}else
		if($("tpSchedule_6").checked) {
			this.ctlToPlaceValue.value = $("nuNumSchedule_6").value + " " + this.txtSchedule_6 + " " + $("nuNumScheduleDir_6").value;
			startChar = new String($("nuNumScheduleDir_6").value).charAt(0);
			this.inputSchedule.value = "6;" + $("nuNumSchedule_6").value + ";" + startChar;
	}
}

org_apache_myfaces_PopupCalendar.prototype._disableFolder = function(tabid){
	if(tabid == "tab_agendamento_id"){
		tdSchedule.style.display = "none";
		tdButton.style.display = "none";
	}else if(tabid = "tab_calendario_id"){
		tdDate.style.display = "none";
		tdFooter.style.display = "none";
		comboMonthYearRow.style.display = "none";
	}
}

org_apache_myfaces_PopupCalendar.prototype._enableFolder = function(tabid){
	if(tabid == "tab_agendamento_id"){
		tdSchedule.style.display = "";
		tdButton.style.display = "";
	}else if(tabid = "tab_calendario_id"){
		tdDate.style.display = "";
		tdFooter.style.display = "";
		comboMonthYearRow.style.display = "";
	}
}

org_apache_myfaces_PopupCalendar.prototype._getFolderTabsHeight = function(){
	return (folderTabsRow.style.display == "none" ? -2 : folderTabsRow.clientHeight);
}

org_apache_myfaces_PopupCalendar.prototype._tabClickHandler = function(tabid){
	if(tabid != currentTab){
		$(currentTab).className = this.initData.themePrefix + "-pastaDes";
		$(tabid).className = this.initData.themePrefix + "-pastaAtiva";
		this._disableFolder(currentTab);
		this._enableFolder(tabid);
		currentTab = tabid;
	}
	this._popDownMonth();
	this._popDownYear();
}

org_apache_myfaces_PopupCalendar.prototype._createFolderTabs = function(){
	folderTabs = document.createElement("table");
	folderTabs.width = "100%";
	folderTabs.cellPadding = 0;
	folderTabs.cellSpacing = 0;
	folderTabs.border = "0";
	var tr = folderTabs.appendChild(document.createElement("tbody")).appendChild(document.createElement("tr"));

	var td = tr.appendChild(document.createElement("td"));
	td.className = this.initData.themePrefix + "-pastaSep";
	this._appendNbsp(td);

	td = tr.appendChild(document.createElement("td"));
	td.className = this.initData.themePrefix + "-pastaAtiva";
	td.nowrap = "nowrap";
	td.id = "tab_calendario_id";
	Event.observe(td, "click", function(event){
		this._tabClickHandler("tab_calendario_id");
	}.bind(this), false);
	Event.observe(td, "mouseover", function(event){
		this.className = this.className.replace(/Des/, "Over");
	}.bind(td), false);
	Event.observe(td, "mouseout", function(event){
		this.className = this.className.replace(/Over/, "Des");
	}.bind(td), false);
	currentTab = "tab_calendario_id"
	td.appendChild(document.createTextNode("Calend�rio"));

	td = tr.appendChild(document.createElement("td"));
	td.className = this.initData.themePrefix + "-pastaSep";
	this._appendNbsp(td);

	td = tr.appendChild(document.createElement("td"));
	td.className = this.initData.themePrefix + "-pastaDes";
	td.id = "tab_agendamento_id";
	td.nowrap = "nowrap";
	Event.observe(td, "click", function(event){
		this._tabClickHandler("tab_agendamento_id");
	}.bind(this), false);
	Event.observe(td, "mouseover", function(event){
		this.className = this.className.replace(/Des/, "Over");
	}.bind(td), false);
	Event.observe(td, "mouseout", function(event){
		this.className = this.className.replace(/Over/, "Des");
	}.bind(td), false);
	td.appendChild(document.createTextNode("Agendamento"));

	td = tr.appendChild(document.createElement("td"));
	td.className = this.initData.themePrefix + "-pastaFinal";
	td.width = "100%";
	this._appendNbsp(td);
	closeFolderCell = td;

	return folderTabs;
}

org_apache_myfaces_PopupCalendar.prototype._createTopLevelTable = function(){
  topLevelTable = document.createElement("table");
  topLevelTable.className = this.initData.themePrefix + "-table-date-style";
  topLevelTable.width = "100%";
  topLevelTable.style.border = "0";
  topLevelTable.cellSpacing = 0;
  topLevelTable.cellPadding = 0;
  var tbodyDS = document.createElement("tbody");
  topLevelTable.appendChild(tbodyDS);
  var rowDS = document.createElement("tr");
  rowDS.style.border = "0pt";
  tbodyDS.appendChild(rowDS);
  tdDate = document.createElement("td");
  tdDate.style.backgroundColor = "#FFFFFF";
  tdDate.style.verticalAlign = "top";
  rowDS.appendChild(tdDate);
  tdSchedule = document.createElement("td");
  tdSchedule.setAttribute("style", this._getTdScheduleStyle(false));
  rowDS.appendChild(tdSchedule);
  // rodap� do calend�rio
  rowDS = tbodyDS.appendChild(document.createElement("tr"));
  rowDS.className = this.initData.themePrefix + "-today-style";
  tdFooter = rowDS.appendChild(document.createElement("td"));
  tdFooter.style.padding = 2;
  tdFooter.width = "100%";
  // rodap� do agendamento
  tdButton = document.createElement("td");
  rowDS.appendChild(tdButton);
  //tdButton.setAttribute("style", "border:0px; border-left:1px solid #A0A0A0; display:none;");
  //tdButton.setAttribute("style", "border:0px; display:none;");
  tdButton.style.align = "center";
  tdButton.style.height = "16px";
  tdButton.style.vAlign = "bottom";

  /*var doSchedule = document.createElement("a");
  doSchedule.className = this.initData.themePrefix + "-today-style";
  //doSchedule.setAttribute("title", this.initData.gotoString);
  doSchedule.setAttribute("href", "#")
  doSchedule.appendChild(document.createTextNode("Seleciona para agendamento"));
  Event.observe(doSchedule, "click", function(event){
   this.selectSheduleOption();
   this._hideCalendar();
   Event.stop(event);
  }.bindAsEventListener(this), false);
  tdButton.appendChild(doSchedule);*/
  var btOk;
  if(this.ie){
    btOk = tdButton.appendChild(document.createElement("<input type=\"button\">"));
  }else{
    btOk = tdButton.appendChild(document.createElement("input"));
    btOk.type = "button";
  }
  btOk.className = "spwBotao";
  btOk.value = "OK";
  btOk.style.height = "15px";
  Event.observe(btOk, "click", function(event){
   this.selectSheduleOption();
   this._hideCalendar();
   Event.stop(event);
  }.bindAsEventListener(this), false);
  Event.observe(btOk, "mouseover", function(event){
	this.className = "spwBotao-o";
  }.bindAsEventListener(btOk), false);
  Event.observe(btOk, "mouseout", function(event){
	this.className = "spwBotao";
  }.bindAsEventListener(btOk), false);
  this._appendNbsp(tdButton);
  var btCancel;
  if(this.ie){
    btCancel = tdButton.appendChild(document.createElement("<input type=\"button\">"));
  }else{
    btCancel = tdButton.appendChild(document.createElement("input"));
    btCancel.type = "button";
  }
  btCancel.className = "spwBotao";
  btCancel.value = "Cancelar";
  btCancel.style.height = "15px";
  Event.observe(btCancel, "click", function(event){
   this._hideCalendar();
   Event.stop(event);
  }.bindAsEventListener(this), false);
  Event.observe(btCancel, "mouseover", function(event){
	this.className = "spwBotao-o";
  }.bindAsEventListener(btCancel), false);
  Event.observe(btCancel, "mouseout", function(event){
	this.className = "spwBotao";
  }.bindAsEventListener(btCancel), false);
 }

org_apache_myfaces_PopupCalendar.prototype._createAndAppendRow = function(tbody){
  var row = document.createElement("tr");
  tbody.appendChild(row);
  var td = document.createElement("td");
  row.appendChild(td);
  return(td);
}

org_apache_myfaces_PopupCalendar.prototype._createRadio = function(nm, val, id){
	var rd;
	if(this.ie){
		rd = document.createElement("<input name='" + nm + "'>");
	}else{
		rd = document.createElement("input");
		rd.name = nm;
	}
	rd.type = "radio";
	rd.id = nm + "_" + id;
	rd.value = val;
	return(rd);
}

org_apache_myfaces_PopupCalendar.prototype._addNumberOptions = function(select, start, end, selected){
	var option;
	for(var i = start; i <= end; i++){
		option = select.appendChild(document.createElement("option"));
		if(i == selected){
			option.selected = true;
		}
		option.value = i;
		option.appendChild(document.createTextNode(i));
	}
}

org_apache_myfaces_PopupCalendar.prototype._createInputNumber = function(id, value, width){
	var input = document.createElement("input");
	input.id = id;
	input.value = value;
	input.style.width = width;
	return(input);
}

org_apache_myfaces_PopupCalendar.prototype._createDateOffset = function(
		td, radioname, radiovalue, radioid,
		inputid, inputvalue, inputwidth,
		label, selectid, selecfdef){
  function cleanSpaces(ctrl){
	  var value = new String(ctrl.value);
	  if(value.indexOf(" ") > -1){
	 	ctrl.value = value.replace(/ /g, "");
	  }
  }
  var radio = td.appendChild(this._createRadio(radioname, radiovalue, radioid));
  var strong = td.appendChild(document.createElement("strong"));
  var input = strong.appendChild(this._createInputNumber(inputid, inputvalue, inputwidth));
  this._appendNbsp(strong);
  strong.appendChild(document.createTextNode(label));
  this._appendNbsp(strong);
  strong.appendChild(this._createSelectAntesDepois(selectid, selecfdef));
  this._appendNbsp(strong);
  input.name = input.id;
  input.setAttribute('formato', '099');
  input.radioid = radioname + "_" + radioid;

  Event.observe(input, "blur", function(event){
    CM_BLR(this, event);
	cleanSpaces(this);
  }.bind(input), false);
  Event.observe(input, "keypress", function(event){
   CM_KPS(this, event);
  }.bind(input), false);
  Event.observe(input, "keydown", function(event){
    CM_KDN(this, event);
  }.bind(input), false);
  Event.observe(input, "keyup", function(event){
    CM_KUP(this, event);
  }.bind(input), false);
  Event.observe(input, "focus", function(event){
    C_OFC(this, event);
  }.bind(input), false);
  Event.observe(input, "change", function(event){
    $(this.radioid).checked = true;
  }.bind(input), false);

}

org_apache_myfaces_PopupCalendar.prototype._appendOption = function(select, value, selected){
	var option = select.appendChild(document.createElement("option"));
	option.appendChild(document.createTextNode(value));
	option.value = value;
	if(selected){
		option.selected = true;
	}
}

org_apache_myfaces_PopupCalendar.prototype._createSelectAntesDepois = function(id, def){
	var select;
	select = document.createElement("select");
	select.id = id;
	this._appendOption(select, "antes", def != "depois");
	this._appendOption(select, "depois", def == "depois");
	select.value = def;
	return(select);
}

org_apache_myfaces_PopupCalendar.prototype._createScheduleTable = function(){
  scheduleTable = document.createElement("table");
  scheduleTable.className = this.initData.themePrefix + "-table-date-style";
  scheduleTable.cellSpacing = 2;
  scheduleTable.cellPadding = 0;
  var tbody = document.createElement("tbody");
  scheduleTable.appendChild(tbody);
  tdSchedule.style.verticalAlign = "top";
  tdSchedule.appendChild(scheduleTable);

  var row;
  // T�tulo
/*  var row = document.createElement("tr");
  row.className = this.initData.themePrefix + "-title-background-style";
  tbody.appendChild(row);
  var tdTitle = document.createElement("td");
  tdTitle.className = this.initData.themePrefix + "-title-style";
  tdTitle.setAttribute("style", "align:center;height:24px;");
  tdTitle.appendChild(document.createTextNode("Para agendamento"));
  row.appendChild(tdTitle);
*/
/*  tdTitle = row.appendChild(document.createElement("td"));
  tdTitle.className = this.initData.themePrefix + "-title-style";
  tdTitle.setAttribute("style", "align:center;height:24px;");
  var bt = tdTitle.appendChild(document.createElement("input"));
  bt.className = "spwBotao";
  bt.type = "button";
  bt.value = "OK";
  bt.name = "btOkSchedule_";
  bt.id = bt.name;
*/

  // radio buttoms
  var td;
  var radio;
  var strong;

  // primeiro radio
  td = this._createAndAppendRow(tbody);
  radio = td.appendChild(this._createRadio("tpSchedule", "1", "1"));
  radio.checked = true;
  strong = td.appendChild(document.createElement("strong"));
  strong.appendChild(document.createTextNode(this.txtSchedule_1));
  this._appendNbsp(strong);
  this._appendNbsp(strong);

  // segundo radio
  td = this._createAndAppendRow(tbody);
  radio = td.appendChild(this._createRadio("tpSchedule", "2", "2"));
  strong = td.appendChild(document.createElement("strong"));
  text = strong.appendChild(document.createTextNode(this.txtSchedule_2_1));
  this._appendNbsp(strong);
  var select = strong.appendChild(document.createElement("select"));
  select.id = "nuNumSchedule_2";
  Event.observe(select, "change", function(){
    $("tpSchedule_2").checked = true;
  }.bind(this), false);
  this._appendNbsp(strong);
  this._addNumberOptions(select, 1, 31, 1);
  text = strong.appendChild(document.createTextNode(this.txtSchedule_2_2));
  this._appendNbsp(strong);
  this._appendNbsp(strong);

  // terceiro radio
  td = this._createAndAppendRow(tbody);
  radio = this._createRadio("tpSchedule", "3", "3");
  td.appendChild(radio);
  strong = td.appendChild(document.createElement("strong"));
  strong.appendChild(document.createTextNode(this.txtSchedule_3));
  this._appendNbsp(strong);
  this._appendNbsp(strong);

  var input;
  // quarto radio
  td = this._createAndAppendRow(tbody);
  this._createDateOffset(td, "tpSchedule", "4", "4", "nuNumSchedule_4", "15", 30, this.txtSchedule_4, "nuNumScheduleDir_4", "antes")
  Event.observe($("nuNumScheduleDir_4"), "change", function(){
    $("tpSchedule_4").checked = true;
  }.bind(this), false);

  // quinto radio
  td = this._createAndAppendRow(tbody);
  this._createDateOffset(td, "tpSchedule", "5", "5", "nuNumSchedule_5", "2", 30, this.txtSchedule_5, "nuNumScheduleDir_5", "antes");
  Event.observe($("nuNumScheduleDir_5"), "change", function(){
    $("tpSchedule_5").checked = true;
  }.bind(this), false);

  // sexto radio
  td = this._createAndAppendRow(tbody);
  td.style.paddingBottom = "4px";
  this._createDateOffset(td, "tpSchedule", "6", "6", "nuNumSchedule_6", "1", 30, this.txtSchedule_6, "nuNumScheduleDir_6", "antes");
  Event.observe($("nuNumScheduleDir_6"), "change", function(){
    $("tpSchedule_6").checked = true;
  }.bind(this), false);
}

org_apache_myfaces_PopupCalendar.prototype.init = function(containerCtl)
{
 if (this.dom)
 {

 if (!this.calendarDiv)
 {
 for (i = 0; i < this.imgSrc.length; i++)
 this.img[i] = new Image;

 this.containerCtl = containerCtl;
 this.calendarDiv = document.createElement("div");
 this.calendarDiv.id = containerCtl.id + "_calendarDiv";
 this.calendarDiv.className = this.initData.themePrefix + "-div-style";

 Event.observe(this.calendarDiv, "click", function()
 {
 this.bClickOnCalendar = true;
 }.bind(this), false);

 this.containerCtl.appendChild(this.calendarDiv);

 var mainTable = document.createElement("table");
 //var shrinkPopup = (27 - this.initData.columnsWidth) * 7;
 //var popupWidth = ((this.initData.showWeekNumber == 1) ? 250 : 220) - shrinkPopup;
 //mainTable.setAttribute("style", "width:" + popupWidth + "px;");
 mainTable.className = this.initData.themePrefix + "-table-style";
 mainTable.cellPadding = 0;
 // original
 this.calendarDiv.appendChild(mainTable);
 // alterado
 /*this._createTopLevelTable();
 tdDate.appendChild(mainTable);
 this.calendarDiv.appendChild(topLevelTable);
 this._createScheduleTable();*/
 // fim alterado

 //This is necessary for IE. If you don't create a tbody element, the table will never show up!
 var mainBody = document.createElement("tbody");
 mainTable.appendChild(mainBody);

 //Novo c�digo para as pastas
 folderTabsRow = mainBody.appendChild(document.createElement("tr"));
 folderTabsRow.appendChild(document.createElement("td")).appendChild(this._createFolderTabs());
 //fim novo c�digo

 var mainRow = document.createElement("tr");
 comboMonthYearRow = mainRow;
 mainRow.className = this.initData.themePrefix + "-title-background-style";

 mainBody.appendChild(mainRow);

 var mainCell = document.createElement("td");
 mainCell.style.width = "100%";
 mainRow.appendChild(mainCell);

 var contentTable = document.createElement("table");
 contentTable.style.width = "100%";
// var shrinkPopup = (27 - this.initData.columnsWidth) * 7;
// var calendatWidth = ((this.initData.showWeekNumber == 1) ? 248 : 218) - shrinkPopup;
// contentTable.setAttribute("style", "width:" + calendatWidth + "px;");

 var contentBody = document.createElement("tbody");
 contentTable.appendChild(contentBody);

 mainCell.appendChild(contentTable);

 var headerRow = document.createElement("tr");
 contentBody.appendChild(headerRow);

 var captionCell = document.createElement("td");
 captionCell.className = this.initData.themePrefix + "-title-style";
 headerRow.appendChild(captionCell);
 Event.observe(captionCell, "click", function(event){
  this._popDownMonth();
  this._popDownYear();
 }.bindAsEventListener(this), false);

 this.captionSpan = document.createElement("span");
 captionCell.appendChild(this.captionSpan);

 closeButtonCell = document.createElement("td");
 closeButtonCell.setAttribute("style", "text-align:right;");
 headerRow.appendChild(closeButtonCell);

 closeCalendarLink = document.createElement("a");
 closeCalendarLink.setAttribute("href", "#");
 Event.observe(closeCalendarLink, "click", function(event)
 {
 this._hideCalendar();
 Event.stop(event);
 }.bindAsEventListener(this), false);

 closeButtonCell.appendChild(closeCalendarLink);

 this.closeCalendarSpan = document.createElement("span");

 closeCalendarLink.appendChild(this.closeCalendarSpan);

 var contentRow = document.createElement("tr");
 mainBody.appendChild(contentRow);

 var contentCell = document.createElement("td");
 contentCell.className = this.initData.themePrefix + "-body-style";
 contentRow.appendChild(contentCell);

 this.contentSpan = document.createElement("span");
 //original
 //contentCell.appendChild(this.contentSpan);
 this._createTopLevelTable();
 tdDate.appendChild(this.contentSpan);
 contentCell.appendChild(topLevelTable);
 this._createScheduleTable();

 if (this.initData.showToday == 1)
 {
 /*var todayRow = document.createElement("tr");
 todayRow.className = this.initData.themePrefix + "-today-style";
 mainBody.appendChild(todayRow);

 var todayCell = document.createElement("td");
 todayCell.className = this.initData.themePrefix + "-today-lbl-style";
 todayRow.appendChild(todayCell);*/

 this.todaySpan = document.createElement("span");
 //original - o c�digo acima tamb�m foi comentado
 //todayCell.appendChild(this.todaySpan);
 //alterado por
 tdFooter.appendChild(this.todaySpan);
 tdFooter.className = this.initData.themePrefix + "-today-lbl-style";
 //fim altera��o
 }

 this.selectMonthDiv = document.createElement("div");
 this.selectMonthDiv.id = this.containerCtl.id + "_selectMonthDiv";
 this.selectMonthDiv.className = this.initData.themePrefix + "-div-style";

 this.containerCtl.appendChild(this.selectMonthDiv);

 this.selectYearDiv = document.createElement("div");
 this.selectYearDiv.id = this.containerCtl.id + "_selectYearDiv";
 this.selectYearDiv.className = this.initData.themePrefix + "-div-style";

 this.containerCtl.appendChild(this.selectYearDiv);

 Event.observe(document, "keypress", this._keypresshandler.bind(this), false);
 Event.observe(document, "click", this._clickhandler.bind(this), false);
 }
 }


 if (!this.ns4)
 {
 if (!this.ie)
 this.yearNow += 1900;

 this._hideCalendar();

 this.monthConstructed = false;
 this.yearConstructed = false;

 if (this.initData.showToday == 1)
 {
 this.todaySpan.appendChild(document.createTextNode(this.initData.todayString + " "))

 var todayLink = document.createElement("a");
 todayLink.className = this.initData.themePrefix + "-today-style";
 todayLink.setAttribute("title", this.initData.gotoString);
 todayLink.setAttribute("href", "#")
 todayLink.appendChild(document.createTextNode(this._todayIsDate()));
 Event.observe(todayLink, "click", function(event)
 {
 //this._closeCalendar();
 //Event.stop(event);

 this.selectedDate.month = this.monthNow;
 this.selectedDate.year = this.yearNow;
 //this._constructCalendar();
 // this two next lines was included to select the current day and close calendar replacing the above line.
 this.selectedDate.date = this.dateNow;
 this._closeCalendar();
 Event.stop(event);
 }.bindAsEventListener(this), false);
 Event.observe(todayLink, "mousemove", function()
 {
 window.status = this.initData.gotoString;
 }.bind(this), false);
 Event.observe(todayLink, "mouseout", function()
 {
 window.status = "";
 }.bind(this), false);

 this.todaySpan.appendChild(todayLink);
 }

 this._appendNavToCaption("left", "spwCalendarLeft");
 this._appendNavToCaption("right", "spwCalendarRight");

 this.monthSpan = document.createElement("span");
 this.monthSpan.className = this.initData.themePrefix + "-title-control-normal-style";

 Event.observe(this.monthSpan, "mouseover", function(event)
 {
 this._swapImage(this.changeMonthImg, "spwCalendarDrop2.gif");
 this.monthSpan.className = this.initData.themePrefix + "-title-control-select-style";
 window.status = this.selectMonthMessage;
 }.bindAsEventListener(this), false);

 Event.observe(this.monthSpan, "mouseout", function(event)
 {
 this._swapImage(this.changeMonthImg, "spwCalendarDrop1.gif");
 this.monthSpan.className = this.initData.themePrefix + "-title-control-normal-style";
 window.status = "";
 }.bindAsEventListener(this), false);

 Event.observe(this.monthSpan, "click", function(event)
 {
 this._popUpMonth();
 Event.stop(event);
 }.bind(this), false);

 this.captionSpan.appendChild(this.monthSpan);
 this._appendNbsp(this.captionSpan);

 this.yearSpan = document.createElement("span");
 this.yearSpan.className = this.initData.themePrefix + "-title-control-normal-style";

 Event.observe(this.yearSpan, "mouseover", function(event)
 {
 this._swapImage(this.changeYearImg, "spwCalendarDrop2.gif");
 this.yearSpan.className = this.initData.themePrefix + "-title-control-select-style";
 window.status = this.selectYearMessage;
 }.bindAsEventListener(this), false);

 Event.observe(this.yearSpan, "mouseout", function(event)
 {
 this._swapImage(this.changeYearImg, "spwCalendarDrop1.gif");
 this.yearSpan.className = this.initData.themePrefix + "-title-control-normal-style";
 window.status = "";
 }.bindAsEventListener(this), false);

 Event.observe(this.yearSpan, "click", function(event)
 {
 this._popUpYear();
 Event.stop(event);
 }.bind(this), false);

 this.captionSpan.appendChild(this.yearSpan);
 this._appendNbsp(this.captionSpan);

 this.bPageLoaded = true;
 }
 this.inited = true;
}

org_apache_myfaces_PopupCalendar.prototype._appendNavToCaption = function(direction, iconName)
{
 var imgLeft = document.createElement("img");
 imgLeft.setAttribute("src", this.initData.imgDir + iconName + "1.gif");
 imgLeft.setAttribute("width","10px");
 imgLeft.setAttribute("height","11px");
 imgLeft.setAttribute("style", "border:0px;")

 var spanLeft = document.createElement("span");

 this._createControl(direction, spanLeft, imgLeft, iconName);

 this._appendNbsp(spanLeft);
 spanLeft.appendChild(imgLeft);
 this._appendNbsp(spanLeft);
 this.captionSpan.appendChild(spanLeft);
 this._appendNbsp(spanLeft);
}

org_apache_myfaces_PopupCalendar.prototype._createControl = function(direction, spanLeft, imgLeft, iconName)
{
 spanLeft.className = this.initData.themePrefix + "-title-control-normal-style";
 Event.observe(spanLeft, "mouseover", function(event)
 {
 this._swapImage(imgLeft, iconName + "2.gif");
 spanLeft.className = this.initData.themePrefix + "-title-control-select-style";
 if (direction == "left")
 {
 window.status = this.scrollLeftMessage;
 }
 else
 {
 window.status = this.scrollRightMessage;
 }
 }.bindAsEventListener(this), false);
 Event.observe(spanLeft, "click", function()
 {
 if (direction == "left")
 {
 this._decMonth();
 }
 else
 {
 this._incMonth();
 }
 }.bind(this), false);
 Event.observe(spanLeft, "mouseout", function(event)
 {
 clearInterval(this.intervalID1);
 this._swapImage(imgLeft, iconName + "1.gif");
 spanLeft.className = "" + this.initData.themePrefix + "-title-control-normal-style";
 window.status = "";
 }.bindAsEventListener(this), false);
 Event.observe(spanLeft, "mousedown", function()
 {
 clearTimeout(this.timeoutID1);
 this.timeoutID1 = setTimeout((function()
 {
 if (direction == "left")
 {
 this._startDecMonth();
 }
 else
 {
 this._startIncMonth();
 }
 }).bind(this), 500)
 }.bind(this), false);
 Event.observe(spanLeft, "mouseup", function()
 {
 clearTimeout(this.timeoutID1);
 clearInterval(this.intervalID1);
 }.bind(this), false);
}

org_apache_myfaces_PopupCalendar.prototype._appendNbsp = function(element)
{
 if (element)
 element.appendChild(document.createTextNode(String.fromCharCode(160)));
}
org_apache_myfaces_PopupCalendar.prototype._todayIsDate = function()
{
 var format = new org_apache_myfaces_SimpleDateFormat(this.initData.todayDateFormat?
 this.initData.todayDateFormat:this.dateFormat,
 this.dateFormatSymbols);
 return format.format(this.today);
}

org_apache_myfaces_PopupCalendar.prototype._hideCalendar = function()
{
 this.calendarDiv.style.visibility = "hidden"
 this.bCalendarHidden = true;
 if (this.selectMonthDiv.style != null)
 {
 this.selectMonthDiv.style.visibility = "hidden";
 }
 if (this.selectYearDiv.style != null)
 {
 this.selectYearDiv.style.visibility = "hidden";
 }

 this._showElement(this.selectMonthDiv);
 this._showElement(this.selectYearDiv);
 this._showElement(this.calendarDiv);
}

org_apache_myfaces_PopupCalendar.prototype._padZero = function(num)
{
 return (num < 10)? '0' + num : num;
}

org_apache_myfaces_PopupCalendar.prototype._constructDate = function(d, m, y)
{
 var format = new org_apache_myfaces_SimpleDateFormat(this.dateFormat, this.dateFormatSymbols);
 return format.format(new Date(y, m, d, this.selectedDate.hour, this.selectedDate.min, this.selectedDate.sec));
}

org_apache_myfaces_PopupCalendar.prototype._closeCalendar = function()
{
 this._hideCalendar();

 if (this.myFacesCtlType != "x:inputDate")
 {
 this.ctlToPlaceValue.value = this._constructDate(this.selectedDate.date, this.selectedDate.month, this.selectedDate.year)
 var onchange = this.ctlToPlaceValue.getAttribute("onchange");
 if (onchange)
 {
 this.ctlToPlaceValue.onblur();
 this.ctlToPlaceValue.onchange();
 }
 }
 else
 {
 document.getElementById(this.myFacesInputDateClientId + ".day").value = this.selectedDate.date;
 document.getElementById(this.myFacesInputDateClientId + ".month").value = this.selectedDate.month + 1;
 document.getElementById(this.myFacesInputDateClientId + ".year").value = this.selectedDate.year;
 }

 if(this.ctlToPlaceValue.previusClassName != null){
	this.ctlToPlaceValue.className = this.ctlToPlaceValue.previusClassName;
	this.ctlToPlaceValue.readOnly = false;
 }
 if(this.inputSchedule != null){
	 this.inputSchedule.value = "";
 }
}

/*** Month Pulldown ***/

org_apache_myfaces_PopupCalendar.prototype._startDecMonth = function()
{
 this.intervalID1 = setInterval((function()
 {
 this._decMonth
 }).bind(this), 80);
}

org_apache_myfaces_PopupCalendar.prototype._startIncMonth = function()
{
 this.intervalID1 = setInterval((function()
 {
 this._incMonth
 }).bind(this), 80);
}

org_apache_myfaces_PopupCalendar.prototype._incMonth = function()
{
 this.selectedDate.month = this.selectedDate.month + 1;
 if (this.selectedDate.month > 11)
 {
 this.selectedDate.month = 0;
 this.selectedDate.year++;
 }
 this._popDownMonth();
 this._popDownYear();
 this._constructCalendar();
}

org_apache_myfaces_PopupCalendar.prototype._decMonth = function()
{
 this.selectedDate.month = this.selectedDate.month - 1;
 if (this.selectedDate.month < 0)
 {
 this.selectedDate.month = 11
 this.selectedDate.year--
 }
 this._popDownMonth();
 this._popDownYear();
 this._constructCalendar()
}


org_apache_myfaces_PopupCalendar.prototype._removeAllChildren = function(element)
{
 while (element && element.hasChildNodes())
 element.removeChild(element.lastChild);
}

org_apache_myfaces_PopupCalendar.prototype._constructMonth = function()
{
 this._popDownYear();
 if (!this.monthConstructed)
 {

 var selectMonthTable = document.createElement("table");
 selectMonthTable.setAttribute("style", "width:70px;border-collapse:collapse;")
 selectMonthTable.className = this.initData.themePrefix + "-dropdown-style";

 this._removeAllChildren(this.selectMonthDiv);

 this.selectMonthDiv.appendChild(selectMonthTable);

 Event.observe(selectMonthTable, "mouseover", function()
 {
 clearTimeout(this.timeoutID1);
 }.bind(this), false);
 Event.observe(selectMonthTable, "mouseout", function(event)
 {
 clearTimeout(this.timeoutID1);
 this.timeoutID1 = setTimeout((function()
 {
 this._popDownMonth()
 }).bind(this), 100);
 Event.stop(event);
 }.bindAsEventListener(this), false);

 var selectMonthTableBody = document.createElement("tbody");
 selectMonthTable.appendChild(selectMonthTableBody);

 for (i = 0; i < 12; i++)
 {
 var sName = this.initData.monthName[i];

 var sNameNode = null;

 if (i == this.selectedDate.month)
 {
 sNameNode = document.createElement("span");
 sNameNode.setAttribute("style", "font-weight:bold;");
 sNameNode.appendChild(document.createTextNode(sName));
 sNameNode.setAttribute("userData",i);
 }
 else
 {
 sNameNode = document.createTextNode(sName);
 }

 var monthRow = document.createElement("tr");
 selectMonthTableBody.appendChild(monthRow);

 var monthCell = document.createElement("td");
 monthCell.setAttribute("userData",i);
 monthRow.appendChild(monthCell);

 Event.observe(monthCell, "mouseover", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-select-style";
 }.bind(this), false);

 Event.observe(monthCell, "mouseout", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-normal-style";
 }.bind(this), false);

 Event.observe(monthCell, "click", function(event)
 {
 this.monthConstructed = false;
 this.selectedDate.month = parseInt(Event.element(event).getAttribute("userData"),10);
 this._constructCalendar();
 this._popDownMonth();
 Event.stop(event);
 }.bindAsEventListener(this), false);

 this._appendNbsp(monthCell);
 monthCell.appendChild(sNameNode);
 this._appendNbsp(monthCell);
 }

 this.monthConstructed = true;
 }
}

org_apache_myfaces_PopupCalendar.prototype._popUpMonth = function()
{
 this._constructMonth();
 this.selectMonthDiv.style.visibility = (this.dom || this.ie)? "visible" : "show";
 this.selectMonthDiv.style.left = parseInt(this._formatInt(this.calendarDiv.style.left), 10) + 48 + "px";
 this.selectMonthDiv.style.top = parseInt(this._formatInt(this.calendarDiv.style.top), 10) + 26 + this._getFolderTabsHeight() + "px";

 this._hideElement(this.selectMonthDiv);
}

org_apache_myfaces_PopupCalendar.prototype._popDownMonth = function()
{
 this.selectMonthDiv.style.visibility = "hidden";
 this._showElement(this.selectMonthDiv);
}

/*** Year Pulldown ***/

org_apache_myfaces_PopupCalendar.prototype._incYear = function()
{
 for (i = 0; i < 7; i++)
 {
 newYear = (i + this.nStartingYear) + 1;

 this._createAndAddYear(newYear, i);
 }
 this.nStartingYear++;
 this.bClickOnCalendar = true;
}

org_apache_myfaces_PopupCalendar.prototype._createAndAddYear = function(newYear, i)
{
 var parentNode = document.getElementById(this.containerCtl.getAttribute("id")+"y" + i);

 this._removeAllChildren(parentNode);

 if (newYear == this.selectedDate.year)
 {
 this._appendNbsp(parentNode);
 var newYearSpan = document.createElement("span");
 newYearSpan.setAttribute("userData",newYear);
 newYearSpan.appendChild(document.createTextNode(newYear));
 parentNode.appendChild(newYearSpan);
 this._appendNbsp(parentNode);
 }
 else
 {
 this._appendNbsp(parentNode);
 parentNode.appendChild(document.createTextNode(newYear));
 this._appendNbsp(parentNode);
 }

 parentNode.setAttribute("userData",newYear);
}


org_apache_myfaces_PopupCalendar.prototype._decYear = function()
{
 for (i = 0; i < 7; i++)
 {
 newYear = (i + this.nStartingYear) - 1;

 this._createAndAddYear(newYear, i);
 }
 this.nStartingYear--;
 this.bClickOnCalendar = true;
}

org_apache_myfaces_PopupCalendar.prototype._constructYear = function()
{
 this._popDownMonth();
 var sHTML = "";
 if (!this.yearConstructed)
 {

 var selectYearTable = document.createElement("table");
 selectYearTable.setAttribute("style", "width:44px;border-collapse:collapse;")
 selectYearTable.className = this.initData.themePrefix + "-dropdown-style";

 this._removeAllChildren(this.selectYearDiv);

 this.selectYearDiv.appendChild(selectYearTable);

 Event.observe(selectYearTable, "mouseover", function()
 {
 clearTimeout(this.timeoutID2);
 }.bind(this), false);
 Event.observe(selectYearTable, "mouseout", function(event)
 {
 clearTimeout(this.timeoutID2);
 this.timeoutID2 = setTimeout((function()
 {
 this._popDownYear()
 }).bind(this), 100);
 Event.stop(event);
 }.bindAsEventListener(this), false);


 var selectYearTableBody = document.createElement("tbody");
 selectYearTable.appendChild(selectYearTableBody);

 var selectYearRowMinus = document.createElement("tr");
 selectYearTableBody.appendChild(selectYearRowMinus);

 var selectYearCellMinus = document.createElement("td");
 selectYearCellMinus.setAttribute("align", "center");

 selectYearCellMinus.appendChild(document.createTextNode("-"));

 selectYearRowMinus.appendChild(selectYearCellMinus);

 Event.observe(selectYearCellMinus, "mouseover", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-select-style";
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellMinus, "mouseout", function(event)
 {
 clearInterval(this.intervalID1);
 Event.element(event).className = this.initData.themePrefix + "-dropdown-normal-style";
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellMinus, "mousedown", function(event)
 {
 clearInterval(this.intervalID1);
 this.intervalID1 = setInterval((function()
 {
 this._decYear();
 }).bind(this), 30);
 Event.stop(event);
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellMinus, "mouseup", function(event)
 {
 clearInterval(this.intervalID1);
 Event.stop(event);
 }.bindAsEventListener(this), false);


 //sHTML = "<tr><td align='center' onmouseover='this.className=\""+this.initData.themePrefix+"-dropdown-select-style\"' onmouseout='clearInterval(this.intervalID1); this.className=\""+this.initData.themePrefix+"-dropdown-normal-style\"' onmousedown='clearInterval(this.intervalID1);this.intervalID1=setInterval(\"_decYear()\",30)' onmouseup='clearInterval(this.intervalID1)'>-</td></tr>";

 this.nStartingYear = this.selectedDate.year - 3;
 var j = 0;
 for (i = this.selectedDate.year - 3; i <= (this.selectedDate.year + 3); i++)
 {
 var sName = i;

 var sNameNode = null;

 if (i == this.selectedDate.year)
 {
 sNameNode = document.createElement("span");
 sNameNode.setAttribute("style", "font-weight:bold;");
 sNameNode.appendChild(document.createTextNode(sName));
 sNameNode.setAttribute("userData", sName);
 }
 else
 {
 sNameNode = document.createTextNode(sName);
 }

 var yearRow = document.createElement("tr");
 selectYearTableBody.appendChild(yearRow);

 var yearCell = document.createElement("td");
 yearCell.setAttribute("userData",sName);
 yearCell.setAttribute("id",this.containerCtl.getAttribute("id")+"y" + j);
 yearRow.appendChild(yearCell);

 Event.observe(yearCell, "mouseover", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-select-style";
 }.bind(this), false);

 Event.observe(yearCell, "mouseout", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-normal-style";
 }.bind(this), false);

 Event.observe(yearCell, "click", function(event)
 {
 var elem = Event.element(event);
 var sYear = null;
 this.selectedDate.year = parseInt(this._formatInt(elem.getAttribute("userData"),10));
 this.yearConstructed = false;
 this._popDownYear();
 this._constructCalendar();
 Event.stop(event);
 }.bindAsEventListener(this), false);

 this._appendNbsp(yearCell);
 yearCell.appendChild(sNameNode);
 this._appendNbsp(yearCell);
 j++;
 }

 var selectYearRowPlus = document.createElement("tr");
 selectYearTableBody.appendChild(selectYearRowPlus);

 var selectYearCellPlus = document.createElement("td");
 selectYearCellPlus.setAttribute("align", "center");

 selectYearCellPlus.appendChild(document.createTextNode("+"));

 selectYearRowPlus.appendChild(selectYearCellPlus);

 Event.observe(selectYearCellPlus, "mouseover", function(event)
 {
 Event.element(event).className = this.initData.themePrefix + "-dropdown-select-style";
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellPlus, "mouseout", function(event)
 {
 clearInterval(this.intervalID2);
 Event.element(event).className = this.initData.themePrefix + "-dropdown-normal-style";
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellPlus, "mousedown", function(event)
 {
 clearInterval(this.intervalID2);
 this.intervalID2 = setInterval((function()
 {
 this._incYear();
 }).bind(this), 30);
 }.bindAsEventListener(this), false);

 Event.observe(selectYearCellPlus, "mouseup", function(event)
 {
 clearInterval(this.intervalID2);
 }.bindAsEventListener(this), false);

 this.yearConstructed = true;
 }
}

org_apache_myfaces_PopupCalendar.prototype._popDownYear = function()
{
 clearInterval(this.intervalID1);
 clearTimeout(this.timeoutID1);
 clearInterval(this.intervalID2);
 clearTimeout(this.timeoutID2);
 this.selectYearDiv.style.visibility = "hidden";
 this._showElement(this.selectYearDiv);
}

org_apache_myfaces_PopupCalendar.prototype._popUpYear = function()
{
 var leftOffset;

 this._constructYear();
 this.selectYearDiv.style.visibility = (this.dom || this.ie) ? "visible" : "show";
 leftOffset = parseInt(this._formatInt(this.calendarDiv.style.left), 10) + this.yearSpan.offsetLeft;
 if (this.ie) leftOffset += 6;
 if (!this.ie) leftOffset += 5;
 this.selectYearDiv.style.left = leftOffset + "px";
 this.selectYearDiv.style.top = parseInt(this._formatInt(this.calendarDiv.style.top), 10) + 26 + this._getFolderTabsHeight() + "px";

 this._hideElement(this.selectYearDiv);
}

/*** calendar ***/
org_apache_myfaces_PopupCalendar.prototype._weekNbr = function(n)
{
 // Algorithm used:
 // From Klaus Tondering's Calendar document (The Authority/Guru)
 // hhtp://www.tondering.dk/claus/calendar.html
 // a = (14-month) / 12
 // y = year + 4800 - a
 // m = month + 12a - 3
 // J = day + (153m + 2) / 5 + 365y + y / 4 - y / 100 + y / 400 - 32045
 // d4 = (J + 31741 - (J mod 7)) mod 146097 mod 36524 mod 1461
 // L = d4 / 1460
 // d1 = ((d4 - L) mod 365) + L
 // WeekNumber = d1 / 7 + 1

 year = n.getFullYear();
 month = n.getMonth() + 1;
 if (this.initData.startAt == 0)
 day = n.getDate() + 1;
 else
 day = n.getDate();

 a = Math.floor((14 - month) / 12);
 y = year + 4800 - a;
 m = month + 12 * a - 3;
 b = Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400);
 J = day + Math.floor((153 * m + 2) / 5) + 365 * y + b - 32045;
 d4 = (((J + 31741 - (J % 7)) % 146097) % 36524) % 1461;
 L = Math.floor(d4 / 1460);
 d1 = ((d4 - L) % 365) + L;
 week = Math.floor(d1 / 7) + 1;

 return week;
}

org_apache_myfaces_PopupCalendar.prototype._appendCell = function(parentElement, value)
{
 var cell = document.createElement("td");
 cell.setAttribute("style", "text-align:right;");

 if (value && value != "")
 {
 cell.appendChild(document.createTextNode(value));
 }
 else
 {
 this._appendNbsp(cell);
 }

 parentElement.appendChild(cell);
}

org_apache_myfaces_PopupCalendar.prototype._getDateStyle = function(datePointer)
{
 var sStyle = this.initData.themePrefix + "-normal-day-style";
 //regular day

 if ((datePointer == this.dateNow) &&
 (this.selectedDate.month == this.monthNow) && (this.selectedDate.year == this.yearNow)) //today
 {
 sStyle = this.initData.themePrefix + "-current-day-style";
 }
 else if (dayPointer % 7 == (this.initData.startAt * -1) + 1) //end-of-the-week day
 {
 sStyle = this.initData.themePrefix + "-end-of-weekday-style";
 }

 //selected day
 if ((datePointer == this.saveSelectedDate.date) &&
 (this.selectedDate.month == this.saveSelectedDate.month) &&
 (this.selectedDate.year == this.saveSelectedDate.year))
 {
 sStyle += " " + this.initData.themePrefix + "-selected-day-style";
 }

 for (k = 0; k < this.holidaysCounter; k++)
 {
 if ((parseInt(this._formatInt(this.holidays[k].d), 10) == datePointer) && (parseInt(this._formatInt(this.holidays[k].m), 10) == (this.selectedDate.month + 1)))
 {
 if ((parseInt(this._formatInt(this.holidays[k].y), 10) == 0) || ((parseInt(this._formatInt(this.holidays[k].y), 10) == this.selectedDate.year) && (parseInt(this._formatInt(this.holidays[k].y), 10) != 0)))
 {
 sStyle += " " + this.initData.themePrefix + "-holiday-style";
 }
 }
 }

 return sStyle;
}

org_apache_myfaces_PopupCalendar.prototype._getHolidayHint = function(datePointer)
{
 var sHint = "";
 for (k = 0; k < this.holidaysCounter; k++)
 {
 if ((parseInt(this._formatInt(this.holidays[k].d), 10) == datePointer) && (parseInt(this._formatInt(this.holidays[k].m), 10) == (this.selectedDate.month + 1)))
 {
 if ((parseInt(this._formatInt(this.holidays[k].y), 10) == 0) || ((parseInt(this._formatInt(this.holidays[k].y), 10) == this.selectedDate.year) && (parseInt(this._formatInt(this.holidays[k].y), 10) != 0)))
 {
 sHint += sHint == ""?this.holidays[k].desc:"\n" + this.holidays[k].desc;
 }
 }
 }

 return sHint;
}


org_apache_myfaces_PopupCalendar.prototype._constructCalendar = function()
{
 var aNumDays = Array(31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

 var dateMessage;
 var startDate = new Date (this.selectedDate.year, this.selectedDate.month, 1);
 var endDate;

 if (this.selectedDate.month == 1)
 {
 endDate = new Date (this.selectedDate.year, this.selectedDate.month + 1, 1);
 endDate = new Date (endDate - (24 * 60 * 60 * 1000));
 numDaysInMonth = endDate.getDate();
 }
 else
 {
 numDaysInMonth = aNumDays[this.selectedDate.month];
 }

 datePointer = 0;
 dayPointer = startDate.getDay() - this.initData.startAt;

 if (dayPointer < 0)
 dayPointer = 6;

 this._removeAllChildren(this.contentSpan);

 var contentTable = document.createElement("table");
 contentTable.width = "100%";
 contentTable.setAttribute("style", "border:0px;")
 contentTable.className = this.initData.themePrefix + "-body-style";

 this.contentSpan.appendChild(contentTable);

 var contentBody = document.createElement("tbody");
 contentTable.appendChild(contentBody);

 var contentRow = document.createElement("tr");
 contentBody.appendChild(contentRow);

 if (this.initData.showWeekNumber == 1)
 {
 var showWeekNumberCell = document.createElement("td");
 showWeekNumberCell.setAttribute("style", "width:" + this.initData.columnsWidth + "px;font-weight:bold;");

 contentRow.appendChild(showWeekNumberCell);

 showWeekNumberCell.appendChild(document.createTextNode(this.initData.weekString));

 var dividerCell = document.createElement("td");
 dividerCell.setAttribute("style", "width:1px;")
 dividerCell.setAttribute("rowSpan", "7");
 dividerCell.className = this.initData.themePrefix + "-weeknumber-div-style";

 contentRow.appendChild(dividerCell);

 var dividerImg = document.createElement("img");
 dividerImg.setAttribute("src", this.initData.imgDir + "spwCalendarDivider.gif");
 dividerImg.setAttribute("style", "width:1px;");
 dividerCell.appendChild(dividerImg);
 }

 for (i = 0; i < 7; i++)
 {
 var dayNameCell = document.createElement("td");
 dayNameCell.setAttribute("style", "width:" + this.initData.columnsWidth + "px;text-align:right;font-weight:bold;")
 contentRow.appendChild(dayNameCell);

 dayNameCell.appendChild(document.createTextNode(this.initData.dayName[i]));
 }

 var currentRow = document.createElement("tr");
 contentBody.appendChild(currentRow);

 if (this.initData.showWeekNumber == 1)
 {
 this._appendCell(currentRow, this._weekNbr(startDate) + " ");
 }

 for (var i = 1; i <= dayPointer; i++)
 {
 this._appendCell(currentRow);
 }

 for (datePointer = 1; datePointer <= numDaysInMonth; datePointer++)
 {
 dayPointer++;
 var dateCell = document.createElement("td");
 dateCell.setAttribute("style", "text-align:right;");

 currentRow.appendChild(dateCell);

 var sStyle = this._getDateStyle(datePointer);
 var sHint = this._getHolidayHint(datePointer);

 var sSelectStyle = sStyle + " " + this.initData.themePrefix + "-would-be-selected-day-style";
 var sNormalStyle = sStyle;

 var dateLink = document.createElement("a");
 dateLink.className = sStyle;
 dateLink.setAttribute("href", "#");
 dateLink.setAttribute("title", sHint);

 dateLink.sNormalStyle = sNormalStyle;
 dateLink.sSelectStyle = sSelectStyle;
 dateLink.datePointer = datePointer;

 dateCell.appendChild(dateLink);

 Event.observe(dateLink, "mousemove", function(event)
 {
 window.status = this.initData.selectDateMessage.replace("[date]", this._constructDate(datePointer, this.selectedDate.month, this.selectedDate.year));
 }.bindAsEventListener(this), false);
 Event.observe(dateLink, "mouseout", function(event)
 {
 var elem = Event.element(event);
 elem.className = elem.sNormalStyle;
 window.status = "";
 }.bindAsEventListener(this), false);
 Event.observe(dateLink, "click", function(event)
 {
 var elem = Event.element(event);
 this.selectedDate.date = elem.datePointer;
 this._closeCalendar();
 Event.stop(event);
 }.bindAsEventListener(this), false);
 Event.observe(dateLink, "mouseover", function(event)
 {
 var elem = Event.element(event);
 elem.className = elem.sSelectStyle;
 }.bindAsEventListener(this), false);

 if(datePointer < 10){
  this._appendNbsp(dateLink);
  this._appendNbsp(dateLink);
 }
 this._appendNbsp(dateLink);
 dateLink.appendChild(document.createTextNode(datePointer));
 this._appendNbsp(dateLink);

 if ((dayPointer + this.initData.startAt) % 7 == this.initData.startAt)
 {
 currentRow = document.createElement("tr");
 contentBody.appendChild(currentRow);

 if ((this.initData.showWeekNumber == 1) && (datePointer < numDaysInMonth))
 {
 this._appendCell(currentRow, this._weekNbr(new Date(this.selectedDate.year, this.selectedDate.month, datePointer + 1)) + " ");
 }

 }
 }

 this._removeAllChildren(this.monthSpan);

 this._appendNbsp(this.monthSpan);
 this.monthSpan.appendChild(document.createTextNode(this.initData.monthName[this.selectedDate.month]));
 this._appendNbsp(this.monthSpan);

 this.changeMonthImg = document.createElement("img");
 this.changeMonthImg.setAttribute("src", this.initData.imgDir + "spwCalendarDrop1.gif");
 this.changeMonthImg.setAttribute("width","12px");
 this.changeMonthImg.setAttribute("height","10px");
 this.changeMonthImg.setAttribute("style", "border:0px;");

 this.monthSpan.appendChild(this.changeMonthImg);

 this._removeAllChildren(this.yearSpan);

 this._appendNbsp(this.yearSpan);
 this.yearSpan.appendChild(document.createTextNode(this.selectedDate.year));
 this._appendNbsp(this.yearSpan);

 this.changeYearImg = document.createElement("img");
 this.changeYearImg.setAttribute("src", this.initData.imgDir + "spwCalendarDrop1.gif");
 this.changeYearImg.setAttribute("width","12px");
 this.changeYearImg.setAttribute("height","10px");
 this.changeYearImg.setAttribute("style", "border:0px;");

 this.yearSpan.appendChild(this.changeYearImg);

 this._removeAllChildren(this.closeCalendarSpan);

 var closeButtonImg = document.createElement("img");
 closeButtonImg.setAttribute("src", this.initData.imgDir + "spwCalendarClose.gif");
 closeButtonImg.setAttribute("width","15px");
 closeButtonImg.setAttribute("height","13px");
 closeButtonImg.setAttribute("style", "border:0px;");
 closeButtonImg.setAttribute("alt", "Close the calendar");
 closeButtonImg.border = "0";

 this.closeCalendarSpan.appendChild(closeButtonImg);

 this._recalculateElement(this.calendarDiv);
}

org_apache_myfaces_PopupCalendar.prototype._configScheduleValue = function(ctlScheduleValue){
	$("tpSchedule_1").checked = true;
	$("nuNumSchedule_2").value = "1";
	$("nuNumSchedule_4").value = "15";
	$("nuNumSchedule_5").value = "2";
	$("nuNumSchedule_6").value = "1";
	$("nuNumScheduleDir_4").value = "antes";
	$("nuNumScheduleDir_5").value = "antes";
	$("nuNumScheduleDir_6").value = "antes";
	if(ctlScheduleValue == null || ctlScheduleValue == ""){
		return;
	}
	var vals = new String(ctlScheduleValue).split(";");
	if(vals.length >= 1){
		$("tpSchedule_" + vals[0]).checked = true;
	}
	if(vals.length >= 2){
		if(vals[0] == "2"){
			$("nuNumSchedule_2").value = vals[1];
		}else if(vals[0] >= "4" && vals[0] <= "6"){
			$("nuNumSchedule_" + vals[0]).value = vals[1];
		}
	}
	if(vals.length >= 3){
		if(vals[0] >= "4" && vals[0] <= "6"){
			if(vals[2] == "a"){
				$("nuNumScheduleDir_" + vals[0]).value = "antes";
			}else{
				$("nuNumScheduleDir_" + vals[0]).value = "depois";
			}
		}
	}
}

org_apache_myfaces_PopupCalendar.prototype._popUpSchedule = function(ctl, ctl2, format, imgDir, ctlSchedule){
	if(IMG_isEnabled(ctl)){
		if(!this.inited){
			this.initData.imgDir = imgDir;
			this.init(this.getSpanInstance());
		}

		if(ctlSchedule.value == "") {
			this._enableFolder("tab_calendario_id");
			this._disableFolder("tab_agendamento_id");
			$("tab_calendario_id").className = this.initData.themePrefix + "-pastaAtiva";
			$("tab_agendamento_id").className = this.initData.themePrefix + "-pastaDes";
			currentTab = "tab_calendario_id"
		}else {
			this._disableFolder("tab_calendario_id");
			this._enableFolder("tab_agendamento_id");
			$("tab_calendario_id").className = this.initData.themePrefix + "-pastaDes";
			$("tab_agendamento_id").className = this.initData.themePrefix + "-pastaAtiva";
			currentTab = "tab_agendamento_id"
		}
		folderTabsRow.style.display = "";
		this._hideCalendar();
		this.inputSchedule = ctlSchedule;
		if(ctlSchedule != null){
			this._configScheduleValue(ctlSchedule.value);
		}
		this._popUpInternalCalendar(ctl, ctl2, format);
		closeFolderCell.appendChild(closeCalendarLink);
	}
}

org_apache_myfaces_PopupCalendar.prototype._popUpCalendar = function(ctl, ctl2, format, imgDir){
	if(IMG_isEnabled(ctl)){
		if(!this.inited){
			this.initData.imgDir = imgDir;
			this.init(this.getSpanInstance());
		}
		this._enableFolder("tab_calendario_id");
		this._disableFolder("tab_agendamento_id");
		closeButtonCell.appendChild(closeCalendarLink);
		folderTabsRow.style.display = "none";
		this._hideCalendar();
		this.inputSchedule = null;
		this._popUpInternalCalendar(ctl, ctl2, format);
	}
}

org_apache_myfaces_PopupCalendar.prototype._popUpInternalCalendar = function(ctl, ctl2, format)
{
 if (this.bPageLoaded)
 {
 if (this.calendarDiv.style.visibility == "hidden")
 {
 this.ctlToPlaceValue = ctl2;
 this.dateFormat = format;

 var simpleDateFormat = new org_apache_myfaces_SimpleDateFormat(this.dateFormat, this.dateFormatSymbols);
 var dateSelected = simpleDateFormat.parse(ctl2.value);

 if (dateSelected)
 {
 this.selectedDate.sec = dateSelected.getSeconds();
 this.selectedDate.min = dateSelected.getMinutes();
 this.selectedDate.hour = dateSelected.getHours();
 this.selectedDate.date = dateSelected.getDate();
 this.selectedDate.month = dateSelected.getMonth();

 var yearStr = dateSelected.getYear() + "";

 if (yearStr.length < 4)
 {
 yearStr = (parseInt(yearStr, 10) + 1900) + "";
 }

 this.selectedDate.year = parseInt(yearStr, 10);
 }
 else
 {
 this.selectedDate.date = this.dateNow;
 this.selectedDate.month = this.monthNow;
 this.selectedDate.year = this.yearNow;
 }

 this._popUpCalendar_Show(ctl2);
 }
 else
 {
 this._hideCalendar();
 if (this.ctlNow != ctl)
 this._popUpCalendar(ctl, ctl2, format);
 }
 this.ctlNow = ctl;
 }
}

org_apache_myfaces_PopupCalendar.prototype._popUpCalendarForInputDate = function(clientId, format)
{
 if (this.bPageLoaded)
 {
 this.myFacesCtlType = "x:inputDate";
 this.myFacesInputDateClientId = clientId;
 this.dateFormat = format;

 this.selectedDate.date = document.getElementById(clientId + ".day").value != "" ? parseInt(this._formatInt(document.getElementById(clientId + ".day").value), 10) : this.dateNow;
 this.selectedDate.month = document.getElementById(clientId + ".month").value != "-1" ? parseInt(this._formatInt(document.getElementById(clientId + ".month").value), 10) - 1 : this.monthNow;
 this.selectedDate.year = document.getElementById(clientId + ".year").value != "" ? parseInt(this._formatInt(document.getElementById(clientId + ".year").value), 10) : this.yearNow;
 this.ctlNow = document.getElementById(clientId + ".day");
 this._popUpCalendar_Show(document.getElementById(clientId + ".day"));
 }
}

org_apache_myfaces_PopupCalendar.prototype._popUpCalendar_Show = function(ctl)
{
 this.saveSelectedDate.date = this.selectedDate.date;
 this.saveSelectedDate.month = this.selectedDate.month;
 this.saveSelectedDate.year = this.selectedDate.year;

 var leftpos = 0;
 var toppos = 0;

 var aTag = ctl;
 var aTagPositioningisAbsolute = false;
 // Added try-catch to the next loop (MYFACES-870)
 try
 {
 do {
 aTag = aTag.offsetParent;
 leftpos += aTag.offsetLeft;
 toppos += aTag.offsetTop;
 aTagPositioningisAbsolute = (aTag.style.position == "absolute")
 }
 while ((aTag.tagName != "BODY") && (aTag.tagName != "DIV") && (!aTagPositioningisAbsolute));
 }
 catch (ex)
 {
 // ignore
 }

 var leftScrollOffset = 0;
 var topScrollOffset = 0;

 aTag = ctl;
 // Added try-catch (MYFACES-870)
 try
 {
 do {
 leftScrollOffset += aTag.scrollLeft;
 topScrollOffset += aTag.scrollTop;
 aTag = aTag.parentNode;
 }
 while ((aTag.tagName != "BODY") && (aTag.tagName != "DIV") && (aTag.style.position != "absolute"));
 }
 catch (ex)
 {
 // ignore
 }

 //var shrinkPopup = (27 - this.initData.columnsWidth) * 7;
 //var popupWidth = ((this.initData.showWeekNumber == 1) ? 250 : 220) - shrinkPopup;
 //leftpos = leftpos - popupWidth + ctl.clientWidth;
 //leftpos = leftpos - ctl.clientWidth;

 var bodyRect = this._getVisibleBodyRectangle();
 var cal = this.calendarDiv;

 var top = 0;
 var left = 0
 if (aTagPositioningisAbsolute) {
 top = ctl.offsetTop - topScrollOffset + ctl.offsetHeight + 2;
 left = ctl.offsetLeft - leftScrollOffset;
 }
 else {
 top = ctl.offsetTop + toppos - topScrollOffset + ctl.offsetHeight + 2;
 left = ctl.offsetLeft + leftpos - leftScrollOffset;
 }

 if(this.initData.popupLeft)
 {
 left-=cal.offsetWidth;
 }

 if (left + cal.offsetWidth > bodyRect.right)
 {
 left = bodyRect.right - cal.offsetWidth;
 }
 if (top + cal.offsetHeight > bodyRect.bottom)
 {
 top = bodyRect.bottom - cal.offsetHeight;
 }
 if (left < bodyRect.left)
 {
 left = bodyRect.left;
 }
 if (top < bodyRect.top)
 {
 top = bodyRect.top;
 }

 this.calendarDiv.style.left = this.initData.fixedX == -1 ? left + "px": this.initData.fixedX;
 this.calendarDiv.style.top = this.initData.fixedY == -1 ? top + "px": this.initData.fixedY;
 this._constructCalendar(1, this.selectedDate.month, this.selectedDate.year);

 this.calendarDiv.style.visibility = (this.dom || this.ie)? "visible" : "show";
 this.bCalendarHidden = false;

 setTimeout((function()
 {
 this._hideElement(this.calendarDiv);
 }).bind(this), 200);

 this._hideElement(this.calendarDiv);

 this.bClickOnCalendar = true;
}

org_apache_myfaces_PopupCalendar.prototype._getVisibleBodyRectangle = function()
{
 var visibleRect = new org_apache_myfaces_Rectangle();

 if (window.pageYOffset != undefined)
 {
 //Most non IE
 visibleRect.top = window.pageYOffset;
 visibleRect.left = window.pageXOffset;
 }
 else if (document.body && document.body.scrollTop)
 {
 //IE 6 strict mode
 visibleRect.top = document.body.scrollTop;
 visibleRect.left = document.body.scrollLeft;
 }
 else if (document.documentElement && document.documentElement.scrollTop)
 {
 //Older IE
 visibleRect.top = document.documentElement.scrollTop;
 visibleRect.left = document.documentElement.scrollLeft;
 }

 if (window.innerWidth != undefined)
 {
 //Most non-IE
 visibleRect.right = visibleRect.left + window.innerWidth;
 visibleRect.bottom = visibleRect.top + window.innerHeight;
 }
 else if (document.documentElement && document.documentElement.clientHeight)
 {
 //IE 6 strict mode
 visibleRect.right = visibleRect.left + document.documentElement.clientWidth;
 visibleRect.bottom = visibleRect.top + document.documentElement.clientHeight;
 }
 else if (document.body && document.body.clientHeight)
 {
 //IE 4 compatible
 visibleRect.right = visibleRect.left + document.body.clientWidth;
 visibleRect.bottom = visibleRect.top + document.body.clientHeight;
 }
 return visibleRect;
}

function org_apache_myfaces_Rectangle()
{
 this.top = 0;
 this.left = 0;
 this.bottom = 0;
 this.right = 0;
}

org_apache_myfaces_PopupCalendar.prototype._formatInt = function(str)
{

 if (typeof str == 'string')
 {

 //truncate 0 for number less than 10
 if (str.charAt && str.charAt(0) == "0")
 { // <----- Change, added str.charAt for method availability detection (MYFACES)
 return str.charAt(1);
 }

 }
 return str;
}

org_apache_myfaces_PopupCalendar.prototype.initLocalePtBR = function(){
	this.initData.monthName = new Array( resourceMap.getResource('label.js.cal.janeiro'),resourceMap.getResource('label.js.cal.fevereiro'),
		resourceMap.getResource('label.js.cal.marco'),resourceMap.getResource('label.js.cal.abril'),resourceMap.getResource('label.js.cal.maio'),
		resourceMap.getResource('label.js.cal.junho'),resourceMap.getResource('label.js.cal.julho'),resourceMap.getResource('label.js.cal.agosto'),
		resourceMap.getResource('label.js.cal.setembro'),resourceMap.getResource('label.js.cal.outubro'),resourceMap.getResource('label.js.cal.novembro'),
		resourceMap.getResource('label.js.cal.dezembro'));

	this.initData.startAt = 0;
	this.initData.dayName = this.initData.startAt == 0 ?
		new Array(resourceMap.getResource('label.js.cal.dom'),resourceMap.getResource('label.js.cal.seg'),resourceMap.getResource('label.js.cal.ter'),
		resourceMap.getResource('label.js.cal.qua'),resourceMap.getResource('label.js.cal.qui'),resourceMap.getResource('label.js.cal.sex'),
		resourceMap.getResource('label.js.cal.sab'))	: new Array(resourceMap.getResource('label.js.cal.seg'),resourceMap.getResource('label.js.cal.ter'),
		resourceMap.getResource('label.js.cal.qua'),resourceMap.getResource('label.js.cal.qui'),resourceMap.getResource('label.js.cal.sex'),
		resourceMap.getResource('label.js.cal.sab'),resourceMap.getResource('label.js.cal.dom'));

	this.dateFormatSymbols.weekdays = new Array(resourceMap.getResource('label.js.cal.domingo'),resourceMap.getResource('label.js.cal.segunda'),
		resourceMap.getResource('label.js.cal.terca'),resourceMap.getResource('label.js.cal.quarta'),resourceMap.getResource('label.js.cal.quinta'),
		resourceMap.getResource('label.js.cal.sexta'),resourceMap.getResource('label.js.cal.sabado'));

	this.dateFormatSymbols.shortWeekdays = new Array(resourceMap.getResource('label.js.cal.dom'),resourceMap.getResource('label.js.cal.seg'),
		resourceMap.getResource('label.js.cal.ter'),resourceMap.getResource('label.js.cal.qua'),resourceMap.getResource('label.js.cal.qui'),
		resourceMap.getResource('label.js.cal.sex'),resourceMap.getResource('label.js.cal.sab'));

	this.dateFormatSymbols.shortMonths = new Array(resourceMap.getResource('label.js.cal.jan'),resourceMap.getResource('label.js.cal.fev'),
		resourceMap.getResource('label.js.cal.mar'),resourceMap.getResource('label.js.cal.abr'),resourceMap.getResource('label.js.cal.mai'),
		resourceMap.getResource('label.js.cal.jun'),resourceMap.getResource('label.js.cal.jul'),resourceMap.getResource('label.js.cal.ago'),
		resourceMap.getResource('label.js.cal.set'),resourceMap.getResource('label.js.cal.out'),resourceMap.getResource('label.js.cal.nov'),
		resourceMap.getResource('label.js.cal.dez'));

	this.dateFormatSymbols.months = new Array(resourceMap.getResource('label.js.cal.janeiro'),resourceMap.getResource('label.js.cal.fevereiro'),
		resourceMap.getResource('label.js.cal.marco'),resourceMap.getResource('label.js.cal.abril'),resourceMap.getResource('label.js.cal.maio'),
		resourceMap.getResource('label.js.cal.junho'),resourceMap.getResource('label.js.cal.julho'),resourceMap.getResource('label.js.cal.agosto'),
		resourceMap.getResource('label.js.cal.setembro'),resourceMap.getResource('label.js.cal.outubro'),resourceMap.getResource('label.js.cal.novembro'),
		resourceMap.getResource('label.js.cal.dezembro'));

	this.dateFormatSymbols.eras = new Array("AC","DC");
	this.dateFormatSymbols.ampms = new Array("AM","PM");
	this.initData.todayString = resourceMap.getResource('label.js.cal.hoje');
	this.initData.todayDateFormat = resourceMap.getResource('label.js.cal.formatoDt');
	this.initData.weekString = resourceMap.getResource('label.js.cal.semana');
	this.initData.showWeekNumber = 0;
	this.initData.popupLeft = false;
	this.initData.gotoString = resourceMap.getResource('label.js.cal.selDtHoje');
	return this;
}

org_apache_myfaces_PopupCalendar.prototype.getSpanInstance = function(){
	var spanId = "spSpanPopCalendar__";
	var span = document.getElementById(spanId);
	if(span == null){
		var body = document.getElementsByTagName("body")[0];
		span = body.appendChild(document.createElement("span"));
		span.id = spanId;
	}
	return span;
}

spPopCal = (new org_apache_myfaces_PopupCalendar()).initLocalePtBR();
var Relatorio = {

    /**
     *Constantes
     */
    ANTES  : 'a',
    DEPOIS : 'd',

    /**
     * M�todo chamado antes de submeter os dados do formul�rio para visualizar o relat�rio.
     * Basicamente verifica os campos que s�o Date e do tipo agendamento.
     */
    visualizarRelatorio : function() {
        var form = document.forms[0];
        var length = form.length;
        for (var i = 0; i < length; i++) {
            if (form[i].getAttribute("type") == "button" || form[i].getAttribute("type") != "submit" ) {
                if (form[i].getAttribute("formatType") == "DATE") {
                    var tpAgendamento = jQuery(form[i].name + "_tpAgendamento").val();
                    if (tpAgendamento != "" && tpAgendamento) {
                        var data = new Date();
                        var itens = tpAgendamento.split(";");
                        switch (itens[0]) {
                          case "2":
                            data.setDate(itens[1]);
                            break;
                          case "3":
                            data.setDate(data.getMonthMaxDay());
                            break;
                          case "4":
                            if (itens[2] == this.ANTES) {
                                data.roll(Date.TYPE_DAY, -parseInt(itens[1]));
                            } else {
                                if (itens[2] == this.DEPOIS) {
                                    data.roll(Date.TYPE_DAY, parseInt(itens[1]));
                                }
                            }
                            break;
                          case "5":
                            if (itens[2] == this.ANTES) {
                                data.roll(Date.TYPE_DAY, -eval(parseInt(itens[1]) * 7));
                            } else {
                                if (itens[2] == this.DEPOIS) {
                                    data.roll(Date.TYPE_DAY, eval(parseInt(itens[1]) * 7));
                                }
                            }
                            break;
                          case "6":
                            if (itens[2] == this.ANTES) {
                                data.roll(Date.TYPE_MONTH, -parseInt(itens[1]));
                            } else {
                                if (itens[2] == this.DEPOIS) {
                                    data.roll(Date.TYPE_MONTH, parseInt(itens[1]));
                                }
                            }
                            break;
                        }
                        form[i].value = data;
                    } else {
                        jQuery(form[i].name + "_tpAgendamento").disabled = true;
                    }
                }
            }
        }
    },

    agendarRelatorio : function(ctx) {
    	if(ctx != '' && ctx.indexOf('/') == -1){
    		ctx = '/'+ctx;
    	}
        document.forms[0].action = ctx + '/prepareInsertAgendamento.do';
    },

    ctrTpAgendamento : function(field) {

        var nameField = field.name;
        var form = document.forms[0];

        if (nameField == 'agendamento.partirDe') {
            form.tpAgendamento[1].checked = true;
            form.diaSemana[0].selected = true;
            form.diaMes[0].selected = true;
            form.dtEspecifica.value = '';
        }
        else if (nameField == 'agendamento.diaSemana') {
            form.tpAgendamento[2].checked = true;
            form.partirDe.value = '';
            form.diaMes[0].selected = true;
            form.dtEspecifica.value = '';
        }
        else if (nameField == 'agendamento.diaMes') {
            form.tpAgendamento[3].checked = true;
            form.partirDe.value = '';
            form.diaSemana[0].selected = true;
            form.dtEspecifica.value = '';
        }
        else if (nameField == 'agendamento.dtEspecifica') {
            form.tpAgendamento[4].checked = true;
            form.partirDe.value = '';
            form.diaSemana[0].selected = true;
            form.diaMes[0].selected = true;
        }
    },

    ctrTpAgendamentoReset : function() {
        var form = document.forms[0];

        form.partirDe.value = '';
        form.diaSemana[0].selected = true;
        form.diaMes[0].selected = true;
        form.dtEspecifica.value = '';
    },

    validaCampos : function( form ) {
        if ( BENV_isCamposValidos( form ) ) {
            var i;
            var tpAgendamentoTamanho =  form.tpAgendamento.length;

            for ( i=0; i < tpAgendamentoTamanho; i++ ) {
                if ( form.tpAgendamento[i].checked ) {
                    break;
                }
            }

            if ( i == tpAgendamentoTamanho ) {
                alert( resourceMap.getResource('label.js.ag.agendarRelObrigatorio') );
                return false;
            }

            if ( form.tpAgendamento[1].checked ) {
                if ( form.partirDe.value == '' ) {
                    alert( resourceMap.getResource('label.js.ag.apartirDe') );
                    form.partirDe.focus();
                    return false;
                }
            }

            if ( form.tpAgendamento[2].checked ) {
                if ( form.diaSemana.value == 0 ) {
                    alert( resourceMap.getResource('label.js.ag.noDia') );
                    form.diaSemana.focus();
                    return false;
                }
            }

            if ( form.tpAgendamento[3].checked ) {
                if ( form.diaMes.value == 0 ) {
                    alert( resourceMap.getResource('label.js.ag.noDia') );
                    form.diaMes.focus();
                    return false;
                }
            }

            if ( form.tpAgendamento[4].checked ) {
                if ( form.dtEspecifica.value == '' ) {
                    alert( resourceMap.getResource('label.js.ag.naData') );
                    form.dtEspecifica.focus();
                    return false;
                }
            }

            if ( !form.tpEnvio[0].checked && !form.tpEnvio[1].checked && !form.tpEnvio[2].checked ) {
                alert( resourceMap.getResource('label.js.ag.envRelObrigatorio') );
                return false;
            }
            FF_desabilitaBotoes(form);
        }
        else {
            return false;
        }
    },

    validaCamposConsulta : function( form ) {
        form.tpConsulta[0].checked = true;
        if ( BENV_isCamposValidos( form ) ) {
            if (!form.tpConsulta[0].checked && !form.tpConsulta[1].checked && !form.tpConsulta[2].checked) {
                alert( resourceMap.getResource('label.js.ag.tpAgendObrigatorio') );
                return false;
            }
            FF_desabilitaBotoes(form);
        }
        else {
            return false;
        }
    }

}
/**
 * Fun��o para recuperar mensagens gen�ricas.
 * */
function msgKey(key,param){
	var key = resourceMap.getResource(key);
	return key.replace('{0}', param);
}

/**
 * M�todo utilizado para ser sobreescrito pelos projetos que
 * queiram alterar a mensagem de "retorno vazio" do inputSelect.
 * */
function IS_NoResultMessage(sender){
	return resourceMap.getResource('label.js.nenhumRegistroEncontrado');
}
/**var xmlDoc = new ActiveXObject("MSXML2.DOMDocument");
xmlDoc.async = false;
xmlDoc.load( "consulta.xml");
xmlDoc.setProperty( "SelectionLanguage", "XPath" );

var rootXML;
rootXML = xmlDoc.documentElement;**/

//retorna os elementos do filtro de pesquisa
function getElementos( form ) {
    var elementos = new Array();
    var length = form.length;
    for(var i = 0; i < length; i++ ) {
        if( form[i].type == "text" ) {
            elementos[i] = form[i];
        }
    }
    return elementos;
}

//seleciona os elementos do XML baseado nos filtros de pesquisa
function executePesquisaXML( form ){
    if( filtroPesquisaValido( form ) ) {
        limparGrid();
        var elementos = getElementos( form );
        var argumentos = new Array();
        var xmlNode = document.getElementById("mainTable").xmlNode;
        var indiceArgs = 0;
        var elementosTamanho = elementos.length;

        for(var i = 0; i < elementosTamanho; i++ ) {
            var xmlRef = elementos[ i ].xmlRef;
            var argString = "";
            if( isNaN( elementos[ i ].value ) ) {
                if( elementos[i].value != "" ) {
                    var splitQuery = elementos[ i ].value.split(" ");
                  	var spliQueryTamanho = splitQuery.length;
                    for(var j = 0; j < spliQueryTamanho; j++){
                        argString += " [contains(translate("+ xmlRef +",'abcdefghijklmnopqrstuvxzwyz�����������������������','ABCDEFGHIJKLMNOPQRSTUVXZWYZ�����������������������'), '" + splitQuery[j].toUpperCase() + "')] ";
                    }
                    argumentos[ indiceArgs ] = argString;
                    indiceArgs++;
                }
            } else {
                if( elementos[ i ].value != "" ) {
                    var argInteger = " [contains(" + xmlRef + ", '" + elementos[ i ].value + "')] ";
                    argumentos[ indiceArgs ] = argInteger;
                    indiceArgs++;
                }
            }
        }
        var parametros = "";
        var argumentosTamanho = argumentos.length;
        for(var i = 0; i < argumentosTamanho; i++ ) {
            parametros += argumentos[ i ];
        }
        var selecao = rootXML.selectNodes("//" + xmlNode + " " + parametros  );

        var quant = selecao.length;
        verifiqueQtdReg( quant );
        percorraXML( selecao );
    }
}

//percorre o XML com base em uma sele��o realizada
function percorraXML( selecao ) {
    var tabela = document.getElementById( "tabelaResultado" ).childNodes(0);
    var nLinhas = document.getElementById( "qtLinhas" ).childNodes(0).nodeValue;
    document.getElementById( "qtLinhas" ).childNodes(0).nodeValue = (new Number(quant) + new Number(nLinhas));

	var quant = selecao.length;

    for(var i = 0; i < quant; i++) {
        var linha = document.getElementById( "linhaResultado" );
        var linhaNova = linha.cloneNode(1);
        linhaNova.id = "linha_" + i; //define o n�mero da linha para ser identificada pelo checkbox
        var nColunas = linha.childNodes.length;
        tabela.appendChild( linhaNova );
        var k = 0;
        for(var j = 0; j < nColunas; j++ ) {
            var elemento = linhaNova.childNodes( j ).childNodes(0);
            if( elemento.tagName != "INPUT" ) {
                elemento.nodeValue = selecao.item( i ).childNodes(k).text;
                k++;
            } else { //� o checkbox
                elemento.value = i;
            }
        }
    }
}

//verifica se a quantidade � zero ou maior que determinado valor
function verifiqueQtdReg( qtd ) {
    if( qtd > 80 ){
        alert(msgKey("label.js.pesquisaGrande",""));
        return;
    } else if( qtd == 0 ) {
        alert(msgKey("label.js.resultadoVazio",""));
        return;
    }
}
	//fun��o que redireciona a ordena��o dependendo do tipo de grid
	function sortGrid(doc, obj, id){
		if(!isSearchFilterValid()){
			return;
		}
		var grid = getGrid(obj);
		var tpGrid = getTipoGrid(grid);
		if(tpGrid == 'List'){
			sortGridList(doc,obj,id);
		} else if(tpGrid == 'Grid'){
			sortGridGrid(doc,obj,id);
		} else if(tpGrid == 'Search'){
			sortGridSearch(doc,obj,id);
		}
	}

	function SG_getInputValue(input, item, tc){
		if(tc != ''){
			tc = input.getAttribute('formatType');
			if(tc == null){
				tc = 'TEXT';
			}
		}
		item.d = item.d + input.value;
		item.t = tc;
		return tc
	}

	function SG_getSelectValue(select, item, tc){
		if(tc != ''){
			tc = 'TEXT';
		}
		item.d = item.d + select.value;
		item.t = tc;
		return tc;
	}

	function SG_getTextValue(text, item, tc){
		if(tc != ''){
			tc = 'TEXT';
		}
		item.d = item.d + text.nodeValue;
		item.t = tc;
		return tc;
	}

	function SG_getSpanText(span, item, tc){
		if(tc != ''){
			var tipo = span.getAttribute("tipo");
			if(tipo == 'NUMBER' || tipo == 'DATE'){
				tc = tipo;
			}else{
				tc = 'TEXT';
			}
		}
		var nodes = span.childNodes;
		var length = nodes.length;
		for(var i = 0; i < length; i++){
			if(nodes[i].nodeName == '#text'){
				item.d = item.d + nodes[i].nodeValue;
			}
		}
		item.t = tc;
		return tc;
	}

	function SG_getComponentId(nomeGrid, nLinha, propertyName){
		nomeGrid = nomeGrid.charAt(0).toLowerCase() + nomeGrid.substr(1);
		return nomeGrid + '[' + nLinha + '].' + propertyName + '_' + nLinha;
	}

	function SG_coletaDadoDaColuna(componentes, j, item, tipoColuna, sortedBy, nomeGrid, nLinha){
		if(sortedBy != null){
			if(componentes[j].id == sortedBy || componentes[j].name == sortedBy ||
					componentes[j].id == SG_getComponentId(nomeGrid, nLinha, sortedBy)){
				if(componentes[j].tagName == 'INPUT'){
					return SG_getInputValue(componentes[j], item, tipoColuna);
				}else if(componentes[j].tagName == 'SELECT'){
					return SG_getSelectValue(componentes[j], item, tipoColuna);
				}else if(componentes[j].tagName == 'SPAN'){
					return SG_getSpanText(componentes[j], item, tipoColuna);
				}
			}
		}else{
			if(componentes[j].tagName == 'INPUT'){
				if(componentes[j].getAttribute('type') != 'hidden'){
					return SG_getInputValue(componentes[j], item, tipoColuna);
				}
			}else if(componentes[j].tagName == 'SELECT'){
				return SG_getSelectValue(componentes[j], item, tipoColuna);
			}else if(jQuery.trim(componentes[j].nodeValue)!= '' && componentes[j].nodeName == '#text' ){
				return SG_getTextValue(componentes[j], item, tipoColuna);
			}else if(componentes[j].tagName == 'SPAN'){
				return SG_getSpanText(componentes[j], item, tipoColuna);
			}
		}
		return tipoColuna;
	}

	// first td is number 0
	function SG_getTdNumber(tr, tdNumber){
		trChilds = tr.childNodes;
		var y = 0;
		var length = trChilds.length;
		for(var m = 0; m < length; m++){
			if(trChilds[m].tagName == 'TD'){
				if(y++ == tdNumber){
					return trChilds[m];
				}
			}
		}
		return null;
	}

	// first td is number 0
	function SG_getChildNodesOfTDNumber(tr, tdNumber){
		var td = SG_getTdNumber(tr, tdNumber);
		if(td != null){
			return td.childNodes;
		}else{
			return null;
		}
	}

	function SG_getSortedBy(tr, tdNumber){
		var td = SG_getTdNumber(tr, tdNumber);
		var sortedBy = td.getAttribute('sortedBy');
		if(sortedBy != null && sortedBy == ''){
			return null;
		}else{
			return sortedBy;
		}
	}

	//fun��o de ordena��o da grid tipo GRID
	function sortGridGrid(doc, obj, id){
		var grid = getGrid(obj);
		var nomeGrid = getNomeGrid(grid);
		var nuLinhas = getNuLinhas(doc,nomeGrid);
		var itens = new Array();
		var comps = new Array();
		var z = 0;
		var tipoColuna = null;
		var trIdPrefix = 'linha' + nomeGrid + '_';
		// deve somar + 1 ao id porque a htmlgrid:grid possui sempre um <td> inicial (o status)
		var idNovo = new String(id).replace(nomeGrid, "");
		var idNovoNumber = new Number(idNovo);
		var tdNumber = idNovoNumber + 1;
		var sortedBy = SG_getSortedBy(doc.getElementById(trIdPrefix + '-1'), tdNumber);

		//percorre as linhas capturando os componentes da coluna selecionada
		for(var i = 0; i < nuLinhas; i++){
			var tr = doc.getElementById(trIdPrefix + i);
			// deve somar + 1 ao id porque a htmlgrid:grid possui sempre um <td> inicial (o status)
			var componentes = SG_getChildNodesOfTDNumber(tr, tdNumber);
			var item = new ItemCol('',i,'TEXT');
			//pega os inputs, desprezando os hidden
			var componentesLength = componentes.length;
			for(var j = 0; j < componentesLength; j++){
				tipoColuna = SG_coletaDadoDaColuna(componentes, j, item, tipoColuna, sortedBy, nomeGrid, i);
			}
			itens[z] = item;
			z++;
		}
		//da refresh nas outras colunas e pega o sentido da ordena��o
		var ordenacao = refreshStatusCols(obj,id);
		//pega a fun��o de ordena��o
		var fnSort = getFuncaoSort(ordenacao);
		//pega a fun��o de formata��o dos dados
		var fnConvert = getFuncaoFormatacao(tipoColuna);

		if(tipoColuna != null){
			//formata e ordena os dados
			itens = formataOrdenaDados(fnConvert, fnSort, itens);

			//troca de posi��o as linhas da tabela, colocando de forma ordenada
			var itensLength = itens.length;
			for(var i = 0; i < itensLength; i++){
				trocaPosicaoLinhas(nomeGrid, itens[i].s, doc, getTipoGrid(grid));
			}
		}
	}

	//fun��o de ordena��o da grid tipo LIST
	function sortGridList(doc, obj, id){
		var grid = getGrid(obj);
		var nomeGrid = getNomeGrid(grid);
		var nuLinhas = getNuLinhas(doc,nomeGrid);
		var itens = new Array();
		var comps = new Array();
		var z = 0;
		var tipoColuna;
		// a htmlgrid:list n�o possui um <td> inicial adicional,
		// ent�o a posi��o do td � igual ao valor do id
		var idNovo = new String(id).replace(nomeGrid, "");
		var idNovoNumber = new Number(idNovo);
		var tdNumber = idNovoNumber;

		var sortedBy = null;
		for(var i = 0; i < nuLinhas; i++){
			var tr = doc.getElementById('linha'+ nomeGrid+'_'+i);
			if(i == 0){
				sortedBy = SG_getSortedBy(tr, tdNumber);
			}
			var componentes = SG_getChildNodesOfTDNumber(tr, tdNumber);
			var item = new ItemCol('',i,'TEXT');
			//pega os inputs, desprezando os hidden
			var componentesLength = componentes.length;
			for(var j = 0; j < componentesLength; j++){
				tipoColuna = SG_coletaDadoDaColuna(componentes, j, item, tipoColuna, sortedBy, nomeGrid, i);
			}
			itens[z] = item;
			z++;
		}
		//da refresh nas outras colunas e pega o sentido da ordena��o
		var ordenacao = refreshStatusCols(obj,id);
		//pega a fun��o de ordena��o
		var fnSort = getFuncaoSort(ordenacao);
		//pega a fun��o de formata��o dos dados
		var fnConvert = getFuncaoFormatacao(tipoColuna);

		if(tipoColuna != null){
			//formata e ordena os dados
			itens = formataOrdenaDados(fnConvert, fnSort, itens);

			//troca de posi��o as linhas da tabela, colocando de forma ordenada
			var itensLength = itens.length;
			for(var i = itensLength - 1; i >= 0; i--){
				trocaPosicaoLinhas(nomeGrid, itens[i].s, doc, getTipoGrid(grid));
			}
		}
	}

	//fun��o de ordena��o da grid tipo SEARCH
	function sortGridSearch(doc,obj,id){
		var grid = getGrid(obj);
		var nomeGrid = getNomeGrid(grid);
		var nuLinhas = getNuLinhas(doc,nomeGrid);
		var itens = new Array();
		var comps = new Array();
		var z = 0;
		var tipoColuna;
		var sortedBy = null;
		// deve somar + 1 ao id porque a htmlgrid:search possui sempre um
		// <td> inicial (o checkbox ou radio de sele��o)
		var idNovo = new String(id).replace(nomeGrid, "");
		var idNovoNumber = new Number(idNovo);
		var tdNumber = idNovoNumber + 1;

		for(var i = 0; i < nuLinhas; i++){
			var tr = doc.getElementById('linha_'+i);
			if(i == 0){
				sortedBy = SG_getSortedBy(tr, tdNumber);
			}
			var componentes = SG_getChildNodesOfTDNumber(tr, tdNumber);
			var item = new ItemCol('',i,'TEXT');
			tipoColuna = '';
			var componentesLength = componentes.length;
			for(var j = 0; j < componentesLength; j++){
				if(tipoColuna == ''){
					tipoColuna = componentes[j].parentNode.getAttribute("formatType");
					var checked = tr.getElementsByTagName('INPUT')[0].checked;
					item.t = tipoColuna;
					item.c = checked;
				}
				SG_coletaDadoDaColuna(componentes, j, item, tipoColuna, sortedBy, nomeGrid, i);
			}
			itens[z++] = item;
//			for(var j = 0; j < componentes.length; j++){
//				if(componentes[j].nodeValue != null){
//					if(tipoColuna != ''){
//						tipoColuna = componentes[j].parentNode.getAttribute("formatType");
//					}
//					checked = tr.getElementsByTagName('INPUT')[0].checked;
//					itens[z] = new ItemCol(componentes[j].nodeValue,i,tipoColuna);
//					itens[z].c = checked;
//					z++;
//				}
//			}
		}
		//da refresh nas outras colunas e pega o sentido da ordena��o
		var ordenacao = refreshStatusCols(obj,id);
		//pega a fun��o de ordena��o
		var fnSort = getFuncaoSort(ordenacao);
		//pega a fun��o de formata��o dos dados
		var fnConvert = getFuncaoFormatacao(tipoColuna);
		if(tipoColuna != null){
			//formata e ordena os dados
			itens = formataOrdenaDados(fnConvert, fnSort, itens);

			//troca de posi��o as linhas da tabela, colocando de forma ordenada
			var itensLength = itens.length;
			for(var i = itensLength - 1; i >= 0; i--){
				trocaPosicaoLinhas(nomeGrid, itens[i].s, doc, getTipoGrid(grid));
				doc.getElementById('linha_'+itens[i].s).getElementsByTagName('INPUT')[0].checked = itens[i].c;
			}

			//eh necess�rio selecionar novamente a linha que estava selecionada
			//antes da ordena��o pois o IE n�o estava guardando este estado...
			idSelected = grid.getAttribute('selected');
			mudarSelecaoRegistroAtual(doc.getElementById(idSelected));
		}
	}

	//objeto que encapsula o valor do campo, posi��o original e tipo de dado
	function ItemCol(dado,seq,tipo){
		this.d = dado;
		this.s = seq;
		this.t = tipo;
	}

	//funcao que realiza a troca de posi��o entre as linhas da table
	function trocaPosicaoLinhas(nomeGrid, nuOrdemTR, doc, tipoGrid){
		nomeLinha = 'linha'+ (tipoGrid != 'Search'? nomeGrid : '') + '_' + nuOrdemTR;
		var objTR = doc.getElementById(nomeLinha);
		var table = objTR;
		while(table.nodeName != 'TABLE'){
			table = table.parentNode;
		}
		arrayTR = table.querySelectorAll('tr[id^="linha"]');
		var objRowUltimo;

		//se for list ou search, a ordena��o � do ultimo para o primeiro
		if(tipoGrid == 'List' || tipoGrid == 'Search'){
			objRowUltimo = arrayTR[0];
		}else if(tipoGrid == 'Grid'){
			objRowUltimo = arrayTR[arrayTR.length - 1];
		}
		table.lastChild.insertBefore(objTR, objRowUltimo);
	}

	function getFuncaoFormatacao(tpColuna){
		var fnConvert;
		if(tpColuna == 'DATE'){
			fnConvert = function(a){
				return a.d ? a.d : '00/00/0000';
			};
		}else if(tpColuna == 'NUMBER'){
			fnConvert = function(a){
				return a.d ? parseStrToFloat(a.d) : 0;
			};
		}else{
			fnConvert = function(a){
				return a.d ? a.d.toLowerCase(): '';
			};
		}
		return fnConvert;
	}

	function retiraAcentos(campo) {
    	var acentos = "���������������������������abcdefghijklmnopqrstuvxwyz";
   		var traducao ="AAAAAAAAAEEEEIIOOOOOOUUUUCCABCDEFGHIJKLMNOPQRSTUVXWYZ";
   		var posic, carac;
   		var tempLog = "";

   		if(campo.length === undefined){
   			return campo;
   		}

   		for (var i=0; i < campo.length; i++) {
   			carac = campo.charAt (i);
   			posic  = acentos.indexOf (carac);
   			if (posic > -1)
	  			tempLog += traducao.charAt (posic);
   			else
      			tempLog += campo.charAt (i);
   		}
      	return (tempLog);
	}

	function getFuncaoSort(ordem){
		var fnSort;
		if(ordem == 'asc'){
			fnSort = function(a,b) {
				if(a.t == 'DATE'){
					anoA = a.d.substring(6,10);
					anoB = b.d.substring(6,10);
					if(anoA > anoB) return 1;
					if(anoA < anoB) return -1;
					mesA = a.d.substring(3,5);
					mesB = b.d.substring(3,5);
					if(mesA > mesB) return 1;
					if(mesA < mesB) return -1;
					diaA = a.d.substring(0,2);
					diaB = b.d.substring(0,2);
					if(diaA > diaB) return 1;
					if(diaA < diaB) return -1;
					return 0;
				}else{
					if (retiraAcentos(a.d) < retiraAcentos(b.d)) return -1;
					if (retiraAcentos(a.d) > retiraAcentos(b.d)) return 1;
					return 0;
				}
			};
		} else {
			fnSort = function(a,b) {
				if(a.t == 'DATE'){
					anoA = a.d.substring(6,10);
					anoB = b.d.substring(6,10);
					if(anoA < anoB) return 1;
					if(anoA > anoB) return -1;
					mesA = a.d.substring(3,5);
					mesB = b.d.substring(3,5);
					if(mesA < mesB) return 1;
					if(mesA > mesB) return -1;
					diaA = a.d.substring(0,2);
					diaB = b.d.substring(0,2);
					if(diaA < diaB) return 1;
					if(diaA > diaB) return -1;
					return 0;
				}else{
					if (retiraAcentos(a.d) < retiraAcentos(b.d)) return 1;
					if (retiraAcentos(a.d) > retiraAcentos(b.d)) return -1;
					return 0;
				}
			};
		}
		return fnSort;
	}

	function formataOrdenaDados(funcaoForm, funcaoOrd, dados){
		var dadosLength = dados.length;
		for(var i = 0; i < dadosLength; i++){
			dados[i].d = funcaoForm(dados[i]);
		}
		dados.sort(funcaoOrd);
		return dados;
	}

	function refreshStatusCols(objClicado, idObjClicado){
		ordenacao = objClicado.getAttribute('ord');
		parNode = objClicado;
		while(parNode.nodeName != 'TR'){
			parNode = parNode.parentNode;
		}
		tds = parNode.getElementsByTagName('TD');
		var tdsLength = tds.length;
		for(var i = 0; i < tdsLength; i++){
			var estilo = tds[i].className;
			if(tds[i].className.indexOf('spwCabecalhoDesc') != -1){
				tds[i].className = estilo.substring(0,estilo.indexOf('spwCabecalhoDesc')) + estilo.substring(estilo.indexOf('spwCabecalhoDesc')+16,estilo.length);
			} else if(tds[i].className.indexOf('spwCabecalhoAsc') != -1 ){
				tds[i].className = estilo.substring(0,estilo.indexOf('spwCabecalhoAsc')) + estilo.substring(estilo.indexOf('spwCabecalhoAsc')+16,estilo.length);
			}
			tds[i].setAttribute('ord', null);
		}
		if(ordenacao == 'des' || ordenacao == null || ordenacao == ''){
			objClicado.setAttribute('ord', 'asc');
			objClicado.className = objClicado.className.substring(0,(objClicado.className.indexOf(' spwCabecalhoDesc')==-1?objClicado.className.length:objClicado.className.indexOf(' spwCabecalhoDesc'))) + ' spwCabecalhoAsc';
			return 'asc';
		} else {
			objClicado.setAttribute('ord', 'des');
			objClicado.className = objClicado.className.substring(0,(objClicado.className.indexOf(' spwCabecalhoAsc')==-1?objClicado.className.length:objClicado.className.indexOf(' spwCabecalhoAsc'))) + ' spwCabecalhoDesc';
			return 'des';
		}
	}

	function SG_sortCheckBoxColumn(checkColumn){
		var form = document.forms[0];
		var nuChecks = form.rowSelect.length;
		var checksMarcados = new Array();
		var count = 0;
		for(var i = 0; i < nuChecks; i++){
			if(form.rowSelect[i].checked == true){
				checksMarcados[count++] = form.rowSelect[i].getAttribute('value');
			}
		}
		var nuMarcados = checksMarcados.length;
		if(nuMarcados != nuChecks){
			var table = document.getElementById('tabelaResultado');
			var arrayTR = table.getElementsByTagName('TR');
			var objRowUltimo;
			if(checkColumn.getAttribute('order') != 'firstChecked'){
				objRowUltimo = arrayTR[0];
			}else{
				objRowUltimo = arrayTR[arrayTR.length - 1];
			}

			for(var i = nuMarcados-1; i >= 0; i--){
				var nomeLinha = 'linha_' + checksMarcados[i];
				var objTR = document.getElementById(nomeLinha);
				if(checkColumn.getAttribute('order') != 'firstChecked'){
					table.lastChild.insertBefore(objTR, objRowUltimo);
				}else{
					table.lastChild.insertBefore(objTR, objRowUltimo);
					table.lastChild.insertBefore(objRowUltimo,objTR);
				}
				objTR.getElementsByTagName('INPUT')[0].checked = true;
			}
		}
		if(nuMarcados != 0){
			if(checkColumn.getAttribute('order') == 'firstChecked'){
				checkColumn.setAttribute('order','firstUnchecked');
			} else {
				checkColumn.setAttribute('order','firstChecked');
			}
		}
	}
//FUN??ES DE TIMER PARA ATUALIZA??ES
//*********************************************************

var timerID = null;
var timeout = 10000000;
var started = false;
var lastAccess = 0;

/*Funcao que deve ser sobrecrita para responder aos eventos de tempo.
  Para receber as notifica??es, colocar na TAG body os seguintes m?todos:
      - onunload="Stop()"
*/

function onTime() {
}

function _callOnTime() {
    if( timerID != null ) {
        clearTimeout( timerID );
        clockID  = 0;
    }

     timerID = setInterval("_callOnTime()", timeout);
     onTime();
}

function Start() {
     Start( timeout );
}

function Start( newTimeout ) {
    timeout = newTimeout;
    timerID  = setInterval( "_callOnTime()", timeout );
    started = true;
}

function Stop() {
   if( timerID != null) {
      clearTimeout( timerID );
      timerID  = null;
      started = false;
   }
}
function ST_selecionarSimples(obj) {
	var idSelecionado = document.getElementsByTagName("BODY")[0].getAttribute("idSelecionado");
	var objSelecionado = document.getElementById(idSelecionado);
	if (obj != objSelecionado) {
		if (objSelecionado != null) {
			var table = ST_findPrevious(objSelecionado, "TD");
			table.className = "";
		}
		var table = ST_findPrevious(obj, "TD");
		table.className = "linha-selecionada";
		document.getElementsByTagName("BODY")[0].setAttribute("idSelecionado", obj.id);
		if (obj.getAttribute("leaf") != "true") {
			ST_expand(ST_findPrevious(table, "TABLE"));
		}
	}
	var enabled = obj.getAttribute("enabled");
	var botaoSelecionar = document.getElementById("pbSelecionar");
	if(botaoSelecionar){
		botaoSelecionar.disabled = !(ST_strToBoolean(enabled));
	}
}

function ST_expand(obj) {
	var exp = ST_strToBoolean(obj.getAttribute("expanded"));
	var style = (exp == true ? "none" : "");
	obj.setAttribute("expanded", !exp);
	var table = ST_findNext(obj.nextSibling, "TABLE");
	var divs = table.getElementsByTagName("DIV");
	if (divs.length == 0) {
		return;
	}
	var div = divs[0];
	div.style.display = style;
	var tds = obj.getElementsByTagName("TD");
	for(var i = 0; i < tds.length; i++) {
		if(tds[i].getAttribute("iconeEncolher") == "true") {
			if (exp) {
				tds[i].className = "icone-encolhido";
			} else {
				tds[i].className = "icone-aberto";
			}
			break;
		}
	}
}

function ST_strToBoolean(str) {
	return str == "true" || str == true;
}

function ST_findNext(obj, nodeName) {
	while (obj != null && obj.nodeName != nodeName) {
		obj = obj.nextSibling;
	}
	return obj;
}

function ST_findPrevious(obj, nodeName) {
	while (obj != null && obj.nodeName != nodeName) {
		obj = obj.parentNode;
	}
	return obj;
}

function ST_selecionarNodo() {
	var objRetorno = parent.document.getElementById(idObjRetorno);
	var idSelecionado = document.getElementsByTagName("BODY")[0].getAttribute("idSelecionado");
	var objSelecionado = document.getElementById(idSelecionado);
	if (objSelecionado == null) {
		alert(resourceMap.getResource('label.js.nenhumRegistroSelecionado'));
		return;
	}
	if(isInputSelect(objRetorno)){
		parent.document.getElementById(cdSelecaoReference).value = objSelecionado.getAttribute("cdSelecao");
		parent.document.getElementById(descricaoReference).value = objSelecionado.getAttribute("descricao");
		parent.document.getElementById(cdApresentacaoReference).value = objSelecionado.getAttribute("cdApresentacao");
		habilitaInputsFilhos(objRetorno,document);
	} else {
		var grid = getGrid(objRetorno);
		ST_copiarParaGrid(grid, objRetorno, objSelecionado);
	}

	fecharConsultaById("");
}

//copia uma linha do form de consulta para o grid
function ST_copiarParaGrid(grid, objRetorno, objSelecionado) {
    var nmGrid = getNomeGrid(grid);
    var nuLinhaNova = new Number( parent.document.getElementById("textQtLinhas"+nmGrid).childNodes[0].nodeValue );
    var linha = parent.criarLinha(objRetorno, true, true );

    var idDoElemento = getColumnId(grid, cdSelecaoReference, nuLinhaNova);
    var obj = parent.document.getElementById( idDoElemento );
    if(obj != null){
    	obj.value = url_decode(objSelecionado.getAttribute("cdSelecao"));
    }

    var idDoElemento = getColumnId(grid, descricaoReference, nuLinhaNova);
    var obj = parent.document.getElementById( idDoElemento );
    if(obj != null){
    	obj.value = url_decode(objSelecionado.getAttribute("descricao"));
    }

    var idDoElemento = getColumnId(grid, cdApresentacaoReference, nuLinhaNova);
    var obj = parent.document.getElementById( idDoElemento );
    if(obj != null){
    	obj.value = url_decode(objSelecionado.getAttribute("cdApresentacao"));
    }

    parent.changeActionGridInsert(grid,nuLinhaNova);
    linha.style.display = '';

}

function ST_limparCampoFiltro() {
	document.getElementById("filtroConsulta").value = "";
}

