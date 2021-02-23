(function($) {

	$.saj = $.saj || {};

	$.saj.browser = $.saj.browser || {};

	$.saj.browser.selectionRange = function(input) {
		var range = {};
		if (!$.browser.msie || navigator.userAgent.indexOf("rv:11.0") != -1) {
			range.start = input.selectionStart;
			range.end = input.selectionEnd;
		} else {
			input.focus();
			var ieRange = document.selection.createRange();

			var selectionLength = ieRange.text.length;
			ieRange.moveStart ('character', -input.value.length);
			console.log("werewrwrerwrjiowerjio")
			range.start = ieRange.text.length - selectionLength;
			range.end = range.start + selectionLength;
		}

		range.hasSelection = (range.start < range.end);

		return range;
	};

	$.saj.browser.setCursorPosition = function(input, pos) {
		var $input = $(input);

		// Retorna sem executar se o input ou algum ancestral estiver hidden
		if ($input.is(':hidden') || $input.parents(':hidden')[0]) {
			return;
		}

		// IE?
		if (!$.browser.msie || navigator.userAgent.indexOf("rv:11.0") != -1) {
			input.selectionStart = pos;
			input.selectionEnd = pos;
		} else if(!$input.is(':hidden')&!$input.is(':disabled')){
			input.focus();

			// Create empty selection range
			var selRange = document.selection.createRange();

			// Move selection start and end to 0 position
			selRange.moveStart('character', -input.value.length);
			selRange.moveEnd('character', -input.value.length);

			// Move selection start and end to desired position
			selRange.moveStart('character', pos);
			selRange.moveEnd('character', 0);
			selRange.select();
		}
	};

})(jQuery);
