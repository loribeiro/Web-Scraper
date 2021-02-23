(function($) {
	
	$(function() {
		$('a[id^=incidentesRecursos]').click(controlarDivFilhos);
		var linkProcesso = $('.linkProcesso')
		if (linkProcesso.length === 1) {
			$('a[id^=incidentesRecursos]').click()
		}
	});	
		
	var esconderFilhos = function(cdProcessoPai){
		$('div#divFilhos'+cdProcessoPai).hide();
		$('#imagemMenos'+cdProcessoPai).hide();
		$('#imagemMais'+cdProcessoPai).show();
	};
	
	var mostrarFilhos = function(cdProcessoPai, cdForoProcesso){
		var idDivFilho = 'div#divFilhos'+cdProcessoPai;
		var idImgLoading = 'img#loading'+cdProcessoPai;
		
		$('#imagemMenos'+cdProcessoPai).show();
		$('#imagemMais'+cdProcessoPai).hide();
		if($(idDivFilho+' .linkProcesso:first').size()===0){
			$(idImgLoading).show();
			ajaxConsultaFilhosProcesso(cdProcessoPai, cdForoProcesso, window.saj.env.queryString, idDivFilho,idImgLoading);
		}else{
			$(idDivFilho).show();
		}
	};
	
	var controlarDivFilhos = function() {
		var cdProcessoPai = $(this).attr('cdProcesso');
		var cdForoProcesso = $(this).attr('cdForoProcesso');
		var $divFilhos = $('div#divFilhos'+cdProcessoPai);
		if($divFilhos.is(':visible')){
			esconderFilhos(cdProcessoPai);
		}else{
			mostrarFilhos(cdProcessoPai, cdForoProcesso);
		}
		return false;
	};
	
	var ajaxConsultaFilhosProcesso = function(cdProcessoMaster, cdForoProcesso, parametrosConsulta, idDivFilhosProcesso,idImagem){
		var url = window.saj.env.root+'/obterProcessosFilhos.do?'+parametrosConsulta+'&cdProcessoMaster='+cdProcessoMaster+'&cdForoProcesso='+cdForoProcesso;
		$.ajax({ 
			url: url,
			type: 'GET',
			cache: true, 
			success:function(transport) {
				var $divFilhos = $(idDivFilhosProcesso)
				$divFilhos.html(transport);		
				$divFilhos.find('a[id^="incidentesRecursos"]').click(controlarDivFilhos)
			},
			error:function() {
				$(idDivFilhosProcesso).html('<b>Não foi possível carregar os dados do processo.</b>');		
			},
			complete: function() { 
				$(idDivFilhosProcesso).show();
				$(idImagem).hide();
			}			
		});
	};
	
})(jQuery);
