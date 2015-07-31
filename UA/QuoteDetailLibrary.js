//----------------------------------------//
//---------©2014 SoftLine Ukraine---------//
//----------------------------------------//

if (typeof (softline) == "undefined") { softline = { __namespace: true }; }

softline.onLoad = function () {
    softline.SetParametersFromProduct();

    Xrm.Page.getAttribute('productid').addOnChange(softline.SetParametersFromProduct);
    Xrm.Page.getAttribute('new_usdprice').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('quantity').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_koef').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_sellingusd').addOnChange(softline.SetTotalpurchase);
    Xrm.Page.getAttribute('new_exchangerate').addOnChange(softline.SetTotalpurchase);
}

softline.SetParametersFromProduct = function () {
    if (Xrm.Page.getAttribute('productid').getValue()) {
        var product = Xrm.Page.getAttribute('productid').getValue()[0];

        XrmServiceToolkit.Rest.Retrieve(product.id, "ProductSet", null, null, function (data) {
            if (Xrm.Page.getAttribute('new_manufacturingname').getValue() == null && data.new_manufacturingname.Id) {
                Xrm.Page.getAttribute('new_manufacturingname').setValue([{ id: data.new_manufacturingname.Id, entityType: data.new_manufacturingname.LogicalName, name: data.new_manufacturingname.Name }]);
            }
            if (Xrm.Page.getAttribute('new_producttypecode').getValue() == null && data.ProductTypeCode) {
                Xrm.Page.getAttribute('new_producttypecode').setValue(data.ProductTypeCode.Value);
            }
            if (Xrm.Page.getAttribute('new_sku').getValue() == null && data.ProductNumber) {
                Xrm.Page.getAttribute('new_sku').setValue(data.ProductNumber);
            }
            //if (!Xrm.Page.getAttribute('new_usdprice').getValue() && data.StandardCost) {
            //    Xrm.Page.getAttribute('new_usdprice').setValue(parseFloat(data.StandardCost.Value));
            //}
        },
                function (error) {
                    equal(true, false, error.message);
                },
                false
            );
    }
}

softline.SetTotalpurchase = function () {
    if (Xrm.Page.getAttribute('new_usdprice').getValue() != null &&
        Xrm.Page.getAttribute('new_koef').getValue() != null) {
        SetFieldValue('new_sellingusd', Xrm.Page.getAttribute('new_koef').getValue() * Xrm.Page.getAttribute('new_usdprice').getValue());
    }
    else {
        SetFieldValue('new_sellingusd', 0);
    }
    if (Xrm.Page.getAttribute('new_sellingusd').getValue() != null &&
        Xrm.Page.getAttribute('new_exchangerate').getValue() != null) {
        SetFieldValue('priceperunit', Xrm.Page.getAttribute('new_sellingusd').getValue() * Xrm.Page.getAttribute('new_exchangerate').getValue());
    }
    else {
        SetFieldValue('priceperunit', 0);
    }
    if (Xrm.Page.getAttribute('quantity').getValue() != null) {
        if (Xrm.Page.getAttribute('new_usdprice').getValue() != null) {
            SetFieldValue('new_totalpurchaseusd', Xrm.Page.getAttribute('quantity').getValue() * Xrm.Page.getAttribute('new_usdprice').getValue());
        }
        else {
            SetFieldValue('new_totalpurchaseusd', 0);
        }
        if (Xrm.Page.getAttribute('new_sellingusd').getValue() != null) {
            SetFieldValue('new_generalsellingusd', Xrm.Page.getAttribute('quantity').getValue() * Xrm.Page.getAttribute('new_sellingusd').getValue());
        }
        else {
            SetFieldValue('new_generalsellingusd', 0);
        }
    }
}

function SetFieldValue(FielName, value) {
    Xrm.Page.getAttribute(FielName).setSubmitMode("always");
    Xrm.Page.getAttribute(FielName).setValue(value);
}

var retrieveDetails = function (id) {
    var queryOptions = {
        entityName: "invoicedetail",
        attributes: ["invoiceid"],
        values: [invoiceid],
        columnSet: ["baseamount",
            "new_amountpurchase",
            "new_totalpurchaseusd",
            "tax",
            "new_sellingusd"],
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
};
