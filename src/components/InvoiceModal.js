import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import {BiDownload, BiWindowOpen} from "react-icons/bi";
import jsPDF from 'jspdf';
import {applyPlugin} from "jspdf-autotable";
import data from './resources.json';
applyPlugin(jsPDF);
function recipient(x) {
    if(x.billRecipientNip === "" && x.billRecipient === "" && x.billRecipientAddress === "" && x.billRecipientPhone === "" && x.billRecipientEmail === "" && x.billRecipientBillingAddress === "" && x.billRecipientBank === "") return null;
    else{
        return <Col md={4}><div className="fw-bold">Odbiorca:</div><div>{x.billRecipientNip || ''}</div><div>{x.billRecipient || ''}</div><div>{x.billRecipientAddress || ''}</div><div>{x.billRecipientPhone || ''}</div><div>{x.billRecipientEmail || ''}</div><div>{x.billRecipientBillingAddress || ''}</div><div>{x.billRecipientBank || ''}</div></Col>;
    }
}
function discount(x){
    if(x.discountAmountInd.__html === "<span class=\"fw-bold float-end\" >0.00 zł</span>") {
        return null;
    } else {
        return <tr className="text-end"><td></td><td className="fw-bold" style={{width: '100px'}}>Rabat: </td><td><div dangerouslySetInnerHTML={x.discountAmountInd} /></td></tr>;
    }
}
function tax(x) {
    if(x.taxAmountInd.__html === "<span class=\"fw-bold float-end\" >0.00 zł</span>") {
        return null;
    } else {
        return <tr className="text-end"><td></td><td className="fw-bold" style={{width: '100px'}}>Podatek: </td><td><div dangerouslySetInnerHTML={x.taxAmountInd} /></td></tr>;
    }
}

function addZerosModal(number) {
    if(number%1 === 0) {
        return number.toString() + '.00';
    } else if(number*10%1 === 0) {
        return number.toString() + '0';
    } else {
        return number.toString();
    }
}
let units = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
let tens = ["", "dziesięć", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
let teens = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
let hundreds = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];
let big = ["x", "x", "x", "tysiąc", "tysiące", "tysięcy", "milion", "miliony", "milionów", "miliard", "miliardy", "miliardów", "bilion", "biliony", "bilionów"]

let fulls = ["złoty", "złote", "złotych"];
let pennies = ["grosz", "pennies", "groszy"];
function TNumbersWords(number){
    let je = number % 10;
    let dz = Math.floor(number / 10) % 10;
    let se = Math.floor(number / 100) % 10;
    let words = [];
    if (se > 0) words.push(hundreds[se]);
    if (dz === 1) {
        words.push(teens[je]);
    } else {
        if (dz > 0) words.push(tens[dz]);
        if (je > 0) words.push(units[je]);
    }
    return words.join(" ");
}
function variety(number){
    let je = number % 10;
    let dz = Math.floor(number / 10) % 10;

    if (number === 1) return 0;
    if (dz === 1 && je > 1) return 2;
    if (je >= 2 && je <= 4) return 1;
    return 2;
}
function NWords(number){
    let thirds = [];
    if (number === 0) return "zero";
    while (number > 0){
        thirds.push(number % 1000);
        number = Math.floor(number / 1000);
    }
    let words = [];
    for (let i = 0; i < thirds.length; i++){
        let n = thirds[i];
        if (n > 0){
            if (i > 0){
                let p = variety(n);
                let w = big[i * 3 + p];
                words.push(TNumbersWords(n) + " " + w);
            } else {
                words.push(TNumbersWords(n));
            }
        }
    }
    words.reverse();
    return words.join(" ");
}
function MoneyWords(number, cos){
    return NWords(number) + " " + cos[variety(number)];
}
function InWords(number, fmt=0){
    let Full = Math.floor(number);
    let Pennies = Math.floor(number * 100 + 0.5) % 100;
    let PenniesText;
    if (fmt !== 0) {
        PenniesText = MoneyWords(Pennies, pennies);
    } else {
        PenniesText = Pennies + "/100";
    }
    return MoneyWords(Full, fulls) + " " + PenniesText;
}
//Data preparation
function PreparePlaceAndDateBody(props){
    return {0: props.info.placeOfIssue, 1: props.info.dateOfIssueF, 2: props.info.dueDateF};
}
function PreparePersonInfoBody(props, who){
    let data = "";
    let info = [];
    if(who === "from"){
        info.push(props.info.billFromNip);
        info.push(props.info.billFrom);
        info.push(props.info.billFromAddress);
        info.push(props.info.billFromPhone);
        info.push(props.info.billFromEmail);
        info.push(props.info.billFromBillingAddress);
        info.push(props.info.billFromBank);
    }
    else if(who === "to"){
        info.push(props.info.billToNip);
        info.push(props.info.billTo);
        info.push(props.info.billToAddress);
        info.push(props.info.billToPhone);
        info.push(props.info.billToEmail);
        info.push(props.info.billToBillingAddress);
        info.push(props.info.billToBank);
    }
    else if (who === "recipient"){
        info.push(props.info.billRecipientNip);
        info.push(props.info.billRecipient);
        info.push(props.info.billRecipientAddress);
        info.push(props.info.billRecipientPhone);
        info.push(props.info.billRecipientEmail);
        info.push(props.info.billRecipientBillingAddress);
        info.push(props.info.billRecipientBank);
    }

    for(let i = 0; i < info.length; i++){
        for(let j = 0; j < info[i].length; j++){
            if(info[i][j] === " "){
                info[i] = info[i].slice(1);
                j--;
            } else{
                break;
            }
        }
        if(info[i] !== ""){
            if (data !== "") data += "\n" + info[i];
            else data += info[i];
        }
    }
    return {0: data};
}
function Item(Number, Name, Description, Quantity, PKWIU, Discount, NetPrice, NetValue, Tax, GrossValue){
    this.Number = Number;
    this.Name = Name;
    this.Description = Description;
    this.Quantity = Quantity;
    this.PKWIU = PKWIU;
    this.Discount = Discount;
    this.NetPrice = NetPrice;
    this.NetValue = NetValue;
    this.Tax = Tax;
    this.GrossValue = GrossValue;

}
function PrepareItemBody(props){
    let data = [];
    props.items.map((item) => {
        return data.push(new Item(item.number, item.name, item.description, item.quantity, item.PKWiU, item.discount + "%", addZerosModal(item.netPrice) + props.currency, addZerosModal(item.netValue) + props.currency, item.tax + "%", addZerosModal(item.grossValue) + props.currency))
    })
    return data;
}
function PrepareTaxTableBody(props){
    let percent = [];
    let amount = [];
    let netValue = [];
    let grossValue = [];

    for (let i = 0; i < props.items.length; i++) {
        if (percent.includes(props.items[i].tax)) {
            let index = percent.indexOf(props.items[i].tax);
            amount[index] = props.items[i].taxAmount + amount[index];
            netValue[index] = props.items[i].netValue + netValue[index];
            grossValue[index] = props.items[i].grossValue + grossValue[index];
        } else {
            percent.push(props.items[i].tax);
            amount.push(props.items[i].taxAmount);
            netValue.push(props.items[i].netValue);
            grossValue.push(props.items[i].grossValue);
        }
    }
    let list = [];
    for (let j = 0; j < percent.length; j++) {
        list.push({0: "Podatek VAT " + percent[j] + "%", 1: addZerosModal(netValue[j]) + "zł", 2: addZerosModal(amount[j]) + "zł", 3: addZerosModal(grossValue[j]) + "zł"});
    }
    list.sort(function(a, b) {
        return ((b.percent < a.percent) ? -1 : ((b.percent === a.percent) ? 0 : 1));
    });

    let sumAmount = 0;
    amount.forEach(item=>{
        sumAmount+=item;
    });
    let sumNetValue = 0;
    netValue.forEach(item=>{
        sumNetValue+=item;
    });
    let sumGrossValue = 0;
    grossValue.forEach(item=>{
        sumGrossValue+=item;
    });

    sumAmount = Math.round(sumAmount * 100+ Number.EPSILON) / 100;
    sumNetValue = Math.round(sumNetValue * 100+ Number.EPSILON) / 100;
    sumGrossValue = Math.round(sumGrossValue * 100+ Number.EPSILON) / 100;

    list.push({0: "Razem", 1: addZerosModal(sumNetValue) + "zł", 2: addZerosModal(sumAmount) + "zł", 3: addZerosModal(sumGrossValue) + "zł"});
    return list;
}
function PrepareSummaryBody(props){
    /*paymentMethod, dueDate, Already paid, to pay*/
    let data = [];
    data.push({0: "Sposób płatności: " + props.info.paymentMethod});
    data.push({0: "Termin płatności: " + props.info.dueDateF});
    data.push({0: "Zapłacono: 0.00zł"});
    data.push({0: "Do zapłaty: " + props.info.total + props.currency});
    return data;
}
function PrepareFinalTableHead(props){
    return {0: "Do zapłaty:", 1: props.info.total + props.currency};
}
function PrepareFinalTableContent(props){
    console.log(parseFloat(props.info.total));
    console.log(props.info.total);
    return {content: "Słownie: " + InWords(parseFloat(props.info.total)), colSpan: 2};
}
//PDF making
function AddPlaceAndDateTable(doc, body){
    /*console.error = () => {};*/
    doc.autoTable({
        head: [['Miejsce wystawienia: ', 'Data wystawienia: ', 'Termin płatności: ']],
        body: body,
        pageBreak: 'avoid',
        startY: 17,
        margin: {left: 106},
        headStyles: {
            fillColor: [222, 222, 222],
            setFont: {"Roboto": "bold"},
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            halign: 'center',
            valign: 'middle',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],

        },
        columnStyles: {
            0: {cellWidth: 38},
            1: {cellWidth: 30},
            2: {cellWidth: 30},
        },
        alternateRowStyles: {
          fillColor : [255, 255, 255]
        }
    })


}
function AddPersonInfoTable(doc, head, body, margin, startY=30) {
    doc.autoTable({
        head: head,
        body: body,
        pageBreak: 'avoid',
        margin: margin,
        startY: startY,
        headStyles: {
            fillColor: [222, 222, 222],
            setFont: {"Roboto": "bold"},
            halign: 'center',
            valign: 'middle',
            cellPadding: 0.5,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            valign: 'top',
            fontSize: 9,
        },
        columnStyles: {
            0: {cellWidth: 98, minCellHeight: 0},
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        },
    })
}
function AddItemTable(doc, body, lastY){
    doc.autoTable({
        head: [{ Number: 'Lp.', Name: 'Nazwa', Description: 'Opis', Quantity: 'Ilość [szt]', PKWIU: 'PKWiU', Discount: 'Rabat', NetPrice: 'Cena jedn. netto', NetValue: 'Wartość netto', Tax: 'VAT', GrossValue: 'Wartość brutto'}],
        body: body,
        didDrawPage: function () {
            let totalPagesExp = '{total_pages_count_string}';
            let str = 'Strona ' + doc.internal.getNumberOfPages();
            str = str + ' z ' + totalPagesExp;
            doc.setFontSize(10)
            let pageSize = doc.internal.pageSize;
            let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, 6, pageHeight - 6);
            doc.putTotalPages(totalPagesExp)
        },
        startY: lastY,
        margin: {left: 6},
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            overflowWrap: 'anywhere',
            halign: 'center',
            valign: 'middle',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        headStyles: {
            fillColor: [222, 222, 222],
        },
        columnStyles: {
            Number: {cellWidth: 6, border: 1},
            Name: {cellWidth: 44, halign: 'left'},
            Description: {cellWidth: 30, halign: 'left'},
            Quantity: {cellWidth: 10},
            PKWIU: {cellWidth: 12},
            Discount: {cellWidth: 11},
            NetPrice: {cellWidth: 25, halign: 'right'},
            NetValue: {cellWidth: 25, halign: 'right'},
            Tax: {cellWidth: 10},
            GrossValue: {cellWidth: 25, halign: 'right'},
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        },
    })
}
function AddTaxTable(doc, body, lastY){
    doc.autoTable({
        head: [['Według stawki VAT', 'obrót netto', 'kwota VAT', 'obrót brutto']],
        body: body,
        pageBreak: 'avoid',
        margin: {left: 84},
        startY: lastY,
        headStyles: {
            fillColor: [222, 222, 222],
            setFont: {"Roboto": "bold"},
            halign: 'center',
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            valign: 'middle',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: {cellWidth: 30, halign: 'left'},
            1: {cellWidth: 30, halign: 'right'},
            2: {cellWidth: 30, halign: 'right'},
            3: {cellWidth: 30, halign: 'right'},
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        }
    })
}
function AddSummaryTable(doc, body, lastY){
    doc.autoTable({
        body: body,
        startY: lastY,
        pageBreak: 'avoid',
        margin: {left: 6, top: 6},
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            valign: 'middle',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            cellWidth: 98
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        }
    })
}
function AddFinalTable(doc, head, body, lastY){
    doc.autoTable({
        head: head,
        body: body,
        pageBreak: 'avoid',
        startY: lastY,
        margin: {left: 106, top: 6},
        headStyles: {
            fillColor: [222, 222, 222],
            fontSize: 12,
            halign: 'right',
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            valign: 'middle',
            fontSize: 9,
        },
        columnStyles: {
            0: {cellWidth: 22},
            1: {cellWidth: 76},
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        }
    })
}
function AddSignTable(doc, head, margin, lastY){
    doc.autoTable({
        head: head,
        body: [{}],
        pageBreak: 'avoid',
        margin: margin,
        startY: lastY,
        headStyles: {
            fillColor: [222, 222, 222],
            halign: 'center',
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            valign: 'middle',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: {cellWidth: 60, minCellHeight: 20},
        },
        alternateRowStyles: {
            fillColor : [255, 255, 255]
        }
    })
}
function AddAdditionalInfoTable(doc, body, lastY){
    doc.autoTable({
        head: [[{content: 'Dodatkowe informacje:'}]],
        body: body,
        pageBreak: 'avoid',
        startY: lastY + 10,
        margin: {left: 6},
        headStyles: {
            fillColor: [222, 222, 222],
            halign: 'left',
        },
        styles: {
            font: 'roboto',
            textColor: 'black',
            cellPadding: 0.5,
            overflowWrap: 'anywhere',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: {cellWidth: 198},
        }

    })
}
function GenerateDocument(PlaceAndDateTableBody, PersonInfoTableBody1, PersonInfoTableBody2, PersonInfoTableBody3, InvoiceNumber, ItemTableBody, TaxTableBody, SummaryTableBody, FinalTableHead, FinalTableContent, AdditionalInfoTableBody) {
    let doc = new jsPDF();
    let totalPagesExp = '{total_pages_count_string}';
    doc.setFontSize(20);

    doc.addFileToVFS("Roboto-Regular-normal.ttf", data["roboto-normal"]);
    doc.addFileToVFS("Roboto-Bold-bold.ttf", data["roboto-bold"]);
    doc.addFont("Roboto-Regular-normal.ttf", "roboto", "normal");
    doc.addFont("Roboto-Bold-bold.ttf", "roboto", "bold");


    doc.setFont("Roboto", "normal");
    doc.addImage(data.logo, 'PNG', doc.internal.pageSize.width / 4 - 30, 6, 60, 21.327)

    let PlaceAndDateLastY
    let leftLastY;
    let rightLastY1;
    let rightLastY2;

    AddPlaceAndDateTable(doc, [PlaceAndDateTableBody]);
    PlaceAndDateLastY = doc.lastAutoTable.finalY;
    AddPersonInfoTable(doc, [[{content: 'Sprzedawca:'}]], [PersonInfoTableBody1], {
        left: 6,
        top: 6
    }, PlaceAndDateLastY + 4);
    leftLastY = doc.lastAutoTable.finalY;
    AddPersonInfoTable(doc, [[{content: 'Nabywca:'}]], [PersonInfoTableBody2], {
        left: 106,
        top: 6
    }, PlaceAndDateLastY + 4);
    rightLastY1 = doc.lastAutoTable.finalY;
    AddPersonInfoTable(doc, [[{content: 'Odbiorca:'}]], [PersonInfoTableBody3], {
        left: 106,
        top: 6
    }, doc.lastAutoTable.finalY + 4);
    rightLastY2 = doc.lastAutoTable.finalY;

    let lastY = Math.max(leftLastY, rightLastY1, rightLastY2);

    doc.setLineWidth(0.1)
    doc.setDrawColor(0, 0, 0);
    doc.line(6, PlaceAndDateLastY + 8.5, 6, lastY);
    doc.line(104, PlaceAndDateLastY + 8.5, 104, lastY);
    doc.line(6, lastY, 104, lastY);
    if (rightLastY1 < rightLastY2) {
        doc.line(106, PlaceAndDateLastY + 8.5, 106, rightLastY1);
        doc.line(204, PlaceAndDateLastY + 8.5, 204, rightLastY1);
        doc.line(106, rightLastY1, 204, rightLastY1);
    } else {
        doc.line(106, PlaceAndDateLastY + 8.5, 106, lastY);
        doc.line(204, PlaceAndDateLastY + 8.5, 204, lastY);
        doc.line(106, lastY, 204, lastY);
    }
    doc.line(106, rightLastY1 + 8.5, 106, lastY);
    doc.line(204, rightLastY1 + 8.5, 204, lastY);
    doc.line(106, lastY, 204, lastY);

    doc.setFont("Roboto", "bold");
    doc.text('Faktura VAT nr ' + InvoiceNumber, doc.internal.pageSize.width / 2, lastY + 10, {align: 'center'});
    doc.setFont("Roboto", "normal");

    AddItemTable(doc, ItemTableBody, lastY + 20);
    AddTaxTable(doc, TaxTableBody);
    lastY = doc.lastAutoTable.finalY;
    AddSummaryTable(doc, SummaryTableBody, lastY + 4);
    leftLastY = doc.lastAutoTable.finalY;
    let NewPage = false;
    if (lastY + 4 > doc.lastAutoTable.finalY) {
        NewPage = true;
        doc.setPage(doc.internal.getNumberOfPages() - 1);
    }
    AddFinalTable(doc, [FinalTableHead], [[FinalTableContent]], lastY + 4);
    rightLastY1 = doc.lastAutoTable.finalY;

    let lastY2 = Math.max(leftLastY, rightLastY1);

    if (NewPage) {
        doc.setDrawColor(222, 222, 222)
        doc.setLineWidth(1)
        doc.line(128, 6, 128, 6 + 5.8);
        doc.setLineWidth(0.1);
        doc.setDrawColor(0, 0, 0);
        doc.line(106, 6, 204, 6);
        doc.line(106, 6, 106, lastY2);
        doc.line(204, 6, 204, lastY2);
        doc.line(106, Math.max(leftLastY, rightLastY1), 204, lastY2);
    } else {
        doc.setDrawColor(222, 222, 222)
        doc.setLineWidth(1)
        doc.line(128, lastY + 4.1, 128, lastY + 9.8);
        doc.setLineWidth(0.1);
        doc.setDrawColor(0, 0, 0);
        doc.line(106, lastY+4, 204, lastY+4);
        doc.line(106, lastY+4, 106, lastY2);
        doc.line(204, lastY+4, 204, lastY2);
        doc.line(106, Math.max(leftLastY, rightLastY1), 204, lastY2);
    }

    AddSignTable(doc, [{content: "Podpis wystawiającego"}], {left: 25}, lastY2+4);
    if(lastY2+4 > doc.lastAutoTable.finalY) {
        doc.setPage(doc.internal.getNumberOfPages()-1);
    }
    AddSignTable(doc, [{content: "Podpis odbiorcy"}], {left: 125}, lastY2+4);

    AddAdditionalInfoTable(doc, AdditionalInfoTableBody, doc.lastAutoTable.finalY);

    let str = 'Strona ' + doc.internal.getNumberOfPages();
    str = str + ' z ' + totalPagesExp;
    doc.setFontSize(10)
    let pageSize = doc.internal.pageSize;
    let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    doc.text(str, 6, pageHeight - 6);
    doc.putTotalPages(totalPagesExp)

    return doc
}
function DownloadInvoice(props){
    let doc = GenerateDocument(PreparePlaceAndDateBody(props),PreparePersonInfoBody(props, "from"), PreparePersonInfoBody(props, "to"), PreparePersonInfoBody(props, "recipient"),props.info.invoiceNumber, PrepareItemBody(props), PrepareTaxTableBody(props), PrepareSummaryBody(props), PrepareFinalTableHead(props), PrepareFinalTableContent(props), [{0: props.info.notes}]);
    doc.setProperties({
        title: 'Example: ',
        subject: 'invoice'
    });
    doc.save('table.pdf');
}
function DisplayInvoice(props){
    let doc = GenerateDocument(PreparePlaceAndDateBody(props),PreparePersonInfoBody(props, "from"), PreparePersonInfoBody(props, "to"), PreparePersonInfoBody(props, "recipient"),props.info.invoiceNumber, PrepareItemBody(props), PrepareTaxTableBody(props), PrepareSummaryBody(props), PrepareFinalTableHead(props), PrepareFinalTableContent(props), [{0: props.info.notes}]);
    doc.setProperties({
        title: 'Example: ',
        subject: 'invoice'
    });
    //doc.output('dataurlnewwindow');
    window.open(doc.output('bloburl'))
}


function description(description, hasDescription) {
    if(hasDescription === true) {
        return ' - ' + description;
    } else {
        return description;
    }
}
function addZeros(number) {
    if(number%1 === 0) {
        return number.toString() + '.00';
    } else if(number*10%1 === 0) {
        return number.toString() + '0';
    } else {
        return number.toString();
    }
}



class InvoiceModal extends React.Component {
    render() {
        return(
            <div>
                <Modal show={this.props.showModal} onHide={this.props.closeModal} size="lg" centered>
                    <div id="invoiceCapture">
                        <div className="d-flex flex-row justify-content-between align-items-start bg-light w-100 p-4">
                            <div className="w-100">
                                <h4 className="fw-bold my-2">{this.props.info.billFrom||''}</h4>
                                <h6 className="fw-bold text-secondary mb-1">
                                    Faktura#: {this.props.info.invoiceNumber||''}
                                </h6>
                            </div>
                            <div className="text-end ms-4">
                                <h6 className="fw-bold mt-1 mb-2">Należność:</h6>
                                <h5 className="fw-bold text-secondary"> {this.props.total}{this.props.currency}</h5>
                            </div>
                        </div>
                        <div className="p-4">
                            <Row className="mb-4">
                                <Row className="mb-4">
                                    <Col md={4}>
                                        <div className="fw-bold mt-2">Miejsce wystawienia:</div>
                                        <div>{this.props.info.placeOfIssue}</div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="fw-bold mt-2">Data wystawienia:</div>
                                        <div>{this.props.info.dateOfIssueF}</div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="fw-bold mt-2">Termin płatności:</div>
                                        <div>{this.props.info.dueDateF}</div>
                                    </Col>
                                </Row>
                                <Col md={4}>
                                    <div className="fw-bold">Sprzedawca:</div>
                                    <div>{this.props.info.billFromNip||''}</div>
                                    <div>{this.props.info.billFrom||''}</div>
                                    <div>{this.props.info.billFromAddress||''}</div>
                                    <div>{this.props.info.billFromPhone||''}</div>
                                    <div>{this.props.info.billFromEmail||''}</div>
                                    <div>{this.props.info.billFromBillingAddress||''}</div>
                                    <div>{this.props.info.billFromBank||''}</div>
                                </Col>
                                <Col md={4}>
                                    <div className="fw-bold">Nabywca:</div>
                                    <div>{this.props.info.billToNip||''}</div>
                                    <div>{this.props.info.billTo||''}</div>
                                    <div>{this.props.info.billToAddress||''}</div>
                                    <div>{this.props.info.billToPhone||''}</div>
                                    <div>{this.props.info.billToEmail||''}</div>
                                    <div>{this.props.info.billToBillingAddress||''}</div>
                                    <div>{this.props.info.billToBank||''}</div>
                                </Col>
                                {recipient(this.props.info)}
                            </Row>
                            <Table className="mb-0">
                                <thead>
                                <tr className="text-center" >
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Lp.</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Nazwa/opis produktu</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Ilość</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>PKWiU</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Cena jednostkowa [zł]</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Wartość netto [zł]</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Podatek VAT [%]</th>
                                    <th style={{ paddingLeft:'5px', paddingRight: '5px'}}>Wartość brutto [zł]</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.props.items.map((item, i) => {
                                    return (
                                        <tr id={i} key={i}>
                                            <td className="text-center" style={{width: '0px'}}>{item.number}</td>
                                            <td className="text-center text-break">{item.name}{description(item.description, item.hasDescription)}</td>
                                            <td className="text-center" style={{width: '0px'}}> {item.quantity} </td>
                                            <td className="text-center" style={{width: '0px'}}> {item.PKWiU} </td>
                                            <td className="text-center" style={{width: '0px'}}>{addZeros(item.netPrice)}{this.props.currency}</td>
                                            <td className="text-center" style={{width: '0px'}}> {addZeros(item.netValue)}{this.props.currency}</td>
                                            <td className="text-center" style={{width: '0px'}}> {item.tax}%</td>
                                            <td className="text-center" style={{width: '0px'}}> {addZeros(item.grossValue)}{this.props.currency}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                            <Table>
                                <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>
                                <tr className="text-end">
                                    <td></td>
                                    <td className="fw-bold text-nowrap" style={{width: '100px'}}>Suma częściowa: </td>
                                    <td className="text-end fw-bold" style={{width: '100px'}}>{this.props.subTotal}&nbsp;{this.props.currency}</td>
                                </tr>
                                {discount(this.props)}{/**/}
                                {tax(this.props)}
                                <tr className="text-end">
                                    <td></td>
                                    <td className="fw-bold" style={{width: '100px'}}>Łącznie: </td>
                                    <td className="text-end fw-bold " style={{width: '100px'}}>{this.props.total}&nbsp;{this.props.currency}</td>
                                </tr>
                                </tbody>
                            </Table>
                            {this.props.info.notes &&
                                <div className="bg-light py-3 px-4 rounded">
                                    {this.props.info.notes}
                                </div>}
                        </div>
                    </div>
                    <div className="pb-4 px-4">
                        <Row>
                            <Col md={6}>
                                <Button variant="primary" className="d-block w-100" onClick={() => DownloadInvoice(this.props)}>
                                    <BiDownload style={{width: '15px', height: '15px', marginTop: '-3px'}} className="me-2"/>Pobierz&nbsp;fakturę
                                </Button>
                            </Col>
                            <Col md={6}>
                                <Button variant="outline-primary" className="d-block w-100 mt-3 mt-md-0" onClick={() => DisplayInvoice(this.props)}>
                                    <BiWindowOpen style={{width: '16px', height: '16px', marginTop: '-3px'}} className="me-2"/>
                                    Zobacz&nbsp;fakturę
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                <hr className="mt-4 mb-3"/>
            </div>
        )
    }
}

export default InvoiceModal;
