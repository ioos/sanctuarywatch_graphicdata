// Ivyforms table config object for wpDataTables integration
(function() {
    var IvyformsTableConfig = function() {
        this.formId = null;
        this.fields = [];
        this.dateFrom = null;
        this.dateTo = null;
        this.filterByUser = null;
        this.filterByStarred = false;
        this.filterByRead = null;
    };

    // Form ID
    IvyformsTableConfig.prototype.setFormId = function(formId) {
        this.formId = formId;
    };

    IvyformsTableConfig.prototype.getFormId = function() {
        return this.formId;
    };

    // Fields
    IvyformsTableConfig.prototype.setFields = function(fields) {
        this.fields = fields;
    };

    IvyformsTableConfig.prototype.getFields = function() {
        return this.fields;
    };

    // Date from
    IvyformsTableConfig.prototype.setDateFrom = function(dateFrom) {
        this.dateFrom = dateFrom;
    };

    IvyformsTableConfig.prototype.getDateFrom = function() {
        return this.dateFrom;
    };

    // Date to
    IvyformsTableConfig.prototype.setDateTo = function(dateTo) {
        this.dateTo = dateTo;
    };

    IvyformsTableConfig.prototype.getDateTo = function() {
        return this.dateTo;
    };

    // Filter by user
    IvyformsTableConfig.prototype.setFilterByUser = function(userId) {
        this.filterByUser = userId;
    };

    IvyformsTableConfig.prototype.getFilterByUser = function() {
        return this.filterByUser;
    };

    // Filter by starred
    IvyformsTableConfig.prototype.setFilterByStarred = function(starred) {
        this.filterByStarred = starred;
    };

    IvyformsTableConfig.prototype.getFilterByStarred = function() {
        return this.filterByStarred;
    };

    // Filter by read status
    IvyformsTableConfig.prototype.setFilterByRead = function(status) {
        this.filterByRead = status;
    };

    IvyformsTableConfig.prototype.getFilterByRead = function() {
        return this.filterByRead;
    };

    // Get complete config as JSON
    IvyformsTableConfig.prototype.getConfig = function() {
        return {
            formId: this.formId,
            fields: this.fields,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            filterByUser: this.filterByUser,
            filterByStarred: this.filterByStarred,
            filterByRead: this.filterByRead
        };
    };

    // Initialize global instance
    window.ivyformsTableConfig = new IvyformsTableConfig();
})();
