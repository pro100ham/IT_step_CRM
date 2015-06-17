﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.CreateOpportunityFromInvoise
{
    public class CreateOpp : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory =
                (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                if (context.MessageName.ToLower() != "create" ||
                        context.PrimaryEntityName != Invoice.EntityLogicalName)
                    return;

                var invoice = (Entity)context.InputParameters["Target"];

                var correntInvoice = invoice.ToEntity<Invoice>();

                if (correntInvoice.SalesOrderId != null)
                {
                    return;
                }

                Opportunity orederForCreate = new Opportunity
                {
                    ParentAccountId = correntInvoice.AccountId,
                    Name = correntInvoice.Name,
                    EstimatedCloseDate = correntInvoice.new_Expecteddatepayment,
                    EstimatedValue = correntInvoice.TotalAmount ?? new Money(0),
                    new_margin = correntInvoice.new_margin != null ? correntInvoice.new_margin.Value : 0,
                    TransactionCurrencyId = correntInvoice.TransactionCurrencyId,
                    PriceLevelId = correntInvoice.PriceLevelId,
                    new_currentphase = new OptionSetValue(100000003)
                };
                var oppID = service.Create(orederForCreate);

                Invoice updateInvoice = new Invoice
                {
                    Id = correntInvoice.Id,
                    OpportunityId = new EntityReference { Id = oppID,LogicalName = Opportunity.EntityLogicalName}
                };
                service.Update(updateInvoice);
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}