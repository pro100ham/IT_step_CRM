//----------------------------------------//
//---------©2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.setMarja();
    softline.setTransactionCurrency();
    softline.setExchangerate();

    Xrm.Page.getAttribute('new_datereceipt').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_viborkurs').addOnChange(softline.setExchangerate);
    Xrm.Page.getAttribute('new_amountsreceived').addOnChange(softline.setMarja);
    Xrm.Page.getAttribute('new_exchangerate').addOnChange(softline.setMarja);
}


softline.setExchangerate = function () {
    //Учет текущего курса валюты 
    if (Xrm.Page.getAttribute('new_datereceipt').getValue() &&
        Xrm.Page.getAttribute('new_viborkurs').getValue() != null) {
        var date = Xrm.Page.getAttribute('new_datereceipt').getValue();
        var currencyId = Xrm.Page.getAttribute('transactioncurrencyid').getValue();
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                    "<entity name='new_exchangerates'>" +
                    "<attribute name='new_exchangeratesid' />" +
                    "<attribute name='new_name' />" +
                    "<attribute name='new_megbank' />" +
                    "<attribute name='new_nbu' />" +
                    "<attribute name='createdon' />" +
                    "<order attribute='new_name' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='createdon' operator='on' value='" + date.yyyymmdd() + "' />" +
                    "<condition attribute='transactioncurrencyid' operator='eq' value='" + currencyId[0].id + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";
        var currencyOnDate = XrmServiceToolkit.Soap.Fetch(fetch);

        if (currencyOnDate.length == 0) return;

        switch (Xrm.Page.getAttribute('new_viborkurs').getValue()) {
            case 100000000:
                SetFieldValue('new_exchangerate', currencyOnDate[0].attributes.new_nbu.value);
                softline.setMarja();
                break;
            case 100000001:
                SetFieldValue('new_exchangerate', currencyOnDate[0].attributes.new_megbank.value);
                softline.setMarja();
                break;
            default:
                Xrm.Page.getAttribute('new_exchangerate').setRequiredLevel('required');
                SetFieldValue('new_exchangerate', null);
                break;
        }
    }
}

softline.setTransactionCurrency = function () {
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "гривня", entityType: "transactioncurrency" }]);
        if (Xrm.Page.getAttribute('pricelevelid')) {
            Xrm.Page.getAttribute('pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
        }
    }
}

softline.setMarja = function () {
    if (Xrm.Page.getAttribute('new_expense').getValue() != null) {
        var invoice = Xrm.Page.getAttribute('new_expense').getValue()[0];

        retrieveRecord(invoice.id, 'InvoiceSet', function (data) {

            if (Xrm.Page.getAttribute('new_amountsreceived').getValue() != null &&
                Xrm.Page.getAttribute('new_exchangerate').getValue() != null) {
                var summ = Xrm.Page.getAttribute('new_amountsreceived').getValue();
                var curr = Xrm.Page.getAttribute('new_exchangerate').getValue();
                SetFieldValue('new_postsummausd', summ / curr);
            }
            var all = data.new_summausd == null ? 0 : data.new_summausd;//data.new_marginUSD == null ? 0 : data.new_marginUSD;
            var summ = Xrm.Page.getAttribute('new_postsummausd').getValue();

            if (all != null && summ != null && summ != 0 && all != 0) {
                var res = ((summ / all) * 100);
                Xrm.Page.getAttribute('new_percentagepayment').setValue(res);
            }
            if (data.new_marginUSD != null &&
                Xrm.Page.getAttribute('new_percentagepayment').getValue() != null) {
                var per = Xrm.Page.getAttribute('new_percentagepayment').getValue();
                SetFieldValue('new_marginusd', (data.new_marginUSD*per)/100);
                var curr = Xrm.Page.getAttribute('new_exchangerate').getValue();
                Xrm.Page.getAttribute('new_margin').setValue(((data.new_marginUSD*per)/100) * curr);
            }
        }, null, true, null);
    }
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}