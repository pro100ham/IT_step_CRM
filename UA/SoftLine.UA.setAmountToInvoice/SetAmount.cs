using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using SoftLine.Models;

namespace SoftLine.UA.setAmountToInvoice
{
    public class SetAmount : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.MessageName.ToLower() != "create" ||
                        context.PrimaryEntityName != new_payment.EntityLogicalName)
                    return;

                using (var orgContext = new OrganizationServiceContext(service))
                {
                    var payment = (Entity)context.InputParameters["Target"];
                    var correntpayment = payment.ToEntity<new_payment>();

                    if (correntpayment.new_expense == null) return;

                    var objPayment = (from i in orgContext.CreateQuery<new_payment>()
                                      where i.new_expense == correntpayment.new_expense
                                      select new
                                      {
                                          new_amountsreceived = i.new_amountsreceived ?? new Money(0),
                                          new_percentagepayment = i.new_percentagepayment ?? 0
                                      }).ToList();
                    var amount = objPayment.Sum(item => item.new_amountsreceived.Value);
                    var precent = objPayment.Sum(item => item.new_percentagepayment);

                    Invoice updateEntity = new Invoice()
                    {
                        Id = correntpayment.new_expense.Id,
                        new_amountsreceived = new Money(amount),
                        new_percentage_amount = precent
                    };
                    service.Update(updateEntity);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
