(function ($) {

    var configSelect2LazyLoading = function (opts) {
        $(opts.selector).select2({
            language: 'pt-BR',
            dropdownAutoWidth: true,
            forcebelow: true,
            data: opts.data,

            initSelection: function (element, callback) {
                initSelection(element, callback, opts.data);
            },

            query: function (options) {
                query(options, opts.data);
            }
        });
    };

    var initSelection = function (element, callback, data) {
        var selection = _.find(data, function (searchElement) {
            return searchElement.id === _.parseInt(element.val());
        });

        callback(selection);
    };

    var query = function (options, data) {
        if (!isSearchTermPopulated(options)) {
            configPagination(options, data);
            return;
        }

        if (options.context) {
            configPagination(options);
            return;
        }

        var stripDiacritics = window.Select2.util.stripDiacritics;
        var term = stripDiacritics(options.term.toLowerCase());

        options.context = _.filter(data, function (searchedTerm) {
            if (!searchedTerm.stripped_text) {
                searchedTerm.stripped_text = stripDiacritics(searchedTerm.text.toLowerCase());
            }
            return searchedTerm.stripped_text.indexOf(term) !== -1;
        });

        configPagination(options);
    };

    var configPagination = function (options, filteredData) {
        var data = filteredData || options.context;

        var dataSize = _.size(data);
        var minPageSize = 30;
        var pageSize = dataSize < minPageSize ? dataSize : minPageSize;
        var startIndex = (options.page - 1) * pageSize;

        options.callback({
            context: data,
            results: data.slice(startIndex, startIndex + pageSize),
            more: (startIndex + pageSize) < dataSize
        });
    };

    var isSearchTermPopulated = function (options) {
        return _.size(options.term) > 0;
    };

    $.saj = $.saj || {};
    $.saj.select2LazyLoading = configSelect2LazyLoading;

})(jQuery);
