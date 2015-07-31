//----------------------------------------//
//---------�2015 SoftLine Ukraine---------//
//----------------------------------------//

/// <reference path="XrmPage-vsdoc.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="SDK.REST.js" />

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.SetMarja();
    softline.setTransactionCurrency();
    softline.setOwners();
}

softline.setOwners = function () {
    if (Xrm.Page.data.entity.getId() != "") {
        var fetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                        "<entity name='new_coordinationcontract'>" +
                            "<attribute name='new_coordinationcontractid' />" +
                            "<attribute name='new_name' />" +
                            "<attribute name='new_participationof' />" +
                            "<attribute name='new_participationlaw' />" +
                            "<attribute name='new_participationlo' />" +
                            "<attribute name='new_participationob' />" +
                            "<attribute name='new_participationsp' />" +
                            "<order attribute='new_name' descending='false' />" +
                            "<filter type='and'>" +
                              "<condition attribute='statecode' operator='eq' value='0' />" +
                              "<condition attribute='new_contrsctorder' operator='eq' uitype='salesorder' value='" + Xrm.Page.data.entity.getId() + "' />" +
                        "</filter>" +
                       "</entity>" +
                    "</fetch>";
        var owners = XrmServiceToolkit.Soap.Fetch(fetch);

        if (owners.length == 1) {
            if (owners[0].attributes.new_participationof.value) {
                SetFieldValue("new_articipationof", owners[0].attributes.new_participationof.value);
            }
            if (owners[0].attributes.new_participationof.value) {
                SetFieldValue("new_participationlaw", owners[0].attributes.new_participationlaw.value);
            }
            if (owners[0].attributes.new_participationof.value) {
                SetFieldValue("new_participationlo", owners[0].attributes.new_participationlo.value);
            }
            if (owners[0].attributes.new_participationof.value) {
                SetFieldValue("new_participationob", owners[0].attributes.new_participationob.value);
            }
            if (owners[0].attributes.new_participationof.value) {
                SetFieldValue("new_participationsp", owners[0].attributes.new_participationsp.value);
            }
        }
        else {
            return;
        }
    }
}

softline.SetMarja = function () {
    if (Xrm.Page.data.entity.getId()) {
        var salesdetails = retrieveDetails(Xrm.Page.data.entity.getId());
        if (salesdetails.length != 0) {
            var marja = sumObjectValues("baseamount", salesdetails) - sumObjectValues("new_totalpurchaseuah", salesdetails)
            var procent = 1 - (sumObjectValues("new_totalpurchaseuah", salesdetails) / sumObjectValues("baseamount", salesdetails));
            SetFieldValue("new_marginuah", marja);
            SetFieldValue("new_morginpercentage", procent * 100);
        }
    }
}

softline.setTransactionCurrency = function () {
    if (Xrm.Page.data.entity.getId() == "") {
        Xrm.Page.getAttribute('transactioncurrencyid').setValue([{ id: "D9C8AD06-4BEE-E411-80CF-005056820ECA", name: "������", entityType: "transactioncurrency" }]);
        Xrm.Page.getAttribute('pricelevelid').setValue([{ id: "EA58B320-4BEE-E411-80CF-005056820ECA", name: "Default UAH Pricelist", entityType: "pricelevel" }]);
    }
}

var retrieveDetails = function (quoteId) {
    var queryOptions = {
        entityName: "salesorderdetail",
        attributes: ["salesorderid"],
        values: [quoteId],
        columnSet: ["baseamount",
            "new_totalpurchaseuah"],
        orderby: ["createdon"]
    };
    return XrmServiceToolkit.Soap.QueryByAttribute(queryOptions);
};

var sumObjectValues = function (key, obj) {
    ///<summary>
    /// Method for Sum attributes 
    ///</summary>
    ///</param>
    ///<param name="key" type="String">
    /// Name attribute
    ///</param>
    ///<param name="obj" type="Object">
    /// Oblect XrmServiceToolkit.Soap.QueryByAttribute
    ///</param>
    var sumValue = 0;
    for (var i = 0; i < obj.length; i++) {
        sumValue += obj[i].attributes[key] != null ? obj[i].attributes[key].value : 0;
    }
    return sumValue;
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}