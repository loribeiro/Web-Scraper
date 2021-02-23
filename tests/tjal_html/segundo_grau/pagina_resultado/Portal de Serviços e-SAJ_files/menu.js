
//abre e fecha os itens do menu
function esajMenu(obj){
	var li = obj.parentNode;
	while(li.nodeName != "LI"){
		li = li.parentNode;
	}
	if(li.className == "esajMenuFechado"){
		li.className = "esajMenuAberto";
	}else if(li.className == "esajMenuAberto") {
		li.className = "esajMenuFechado";
	} else 	if(li.className == "esajMenuFechadoCorrente"){
		li.className = "esajMenuAbertoCorrente";
	}else if(li.className == "esajMenuAbertoCorrente") {
		li.className = "esajMenuFechadoCorrente";
	}
	createIframeMenu();
	return false;
}

var clickEmMenu = false;
function showMenuSuspenso(){	
	clickEmMenu = true;
	var layerMenu = document.getElementById("layerMenu");
	var iframeMenu = document.getElementById("iframeMenu");
	var isIE60 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
	
	if(layerMenu.style.display != "none"){
		layerMenu.style.display = "none";
		if(isIE60){
			iframeMenu.style.display = "none";
		}				
		document.onclick = null;
	}else{
		layerMenu.style.display = "";
		document.onclick = function(){
			escondeMenuSuspenso();
		};
		createIframeMenu();
	}
	layerMenu.onclick = function(){
		clickLinkMenuSuspenso();
	};
	return false;
}

function escondeMenuSuspenso(){
	var layerMenu = document.getElementById("layerMenu");
	var iframeMenu = document.getElementById("iframeMenu");
	var isIE60 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
	if(!clickEmMenu && layerMenu.style.display == ""){
		layerMenu.style.display = "none";
		if(isIE60){
			iframeMenu.style.display = "none";
		}
		document.onclick = null;
	}
	clickEmMenu = false;
	return false;
}

function clickLinkMenuSuspenso(){	
	clickEmMenu = true;
}

function createIframeMenu(){
	
	var layerMenu = document.getElementById("layerMenu");
	if(layerMenu == null){
		return;
	}
	var iframeMenu = document.getElementById("iframeMenu");
	var isIE60 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
	if(!isIE60){
		return;
	}
	
	if(iframeMenu == null){			
		var objBody = document.getElementsByTagName("BODY")[0];
		iframeMenu = document.createElement("IFRAME");
		iframeMenu.id = "iframeMenu";
		objBody.appendChild(iframeMenu);
		
		//
		var posY = getPositionY(layerMenu);
		iframeMenu.style.top = posY;
		
		//
		iframeMenu.style.position = "absolute";
		iframeMenu.style.left = 0;
		iframeMenu.style.width = 233;
		iframeMenu.style.zIndex = 1;
		iframeMenu.style.border = "0px";
	}
	
	//
	iframeMenu.style.display = "";
	iframeMenu.style.height = layerMenu.offsetHeight;
	
}

function getPositionY(obj){
	var posY = 0;
	var corpo = document.getElementsByTagName("body")[0];
	var heightObj = obj.offsetHeight;
	while(obj != corpo && obj != null){
		posY += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return posY;
}

//usado para abrir algum servico em um popup (atualmente usado para custas externas no tjsc)
function popup(url){
	window.open(url,'');
}