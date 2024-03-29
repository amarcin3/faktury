// noinspection CommaExpressionJS

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import ShowInvoices from './ShowInvoices';

import AllInfo from './AllInfo.json';
import Invoices1 from './Invoices.json';
let Invoices = Invoices1;

if (localStorage.getItem('AllInfo') !== null) {
    AllInfo[0] = AllInfo[0].concat(JSON.parse(localStorage.getItem('AllInfo'))[0]).reduce((acc, item) => {
        if (!acc.some(i => i.billFromNip === item.billFromNip && i.billFrom === item.billFrom && i.billFromAddress === item.billFromAddress && i.billFromPhone === item.billFromPhone && i.billFromEmail === item.billFromEmail && i.billFromBillingAddress === item.billFromBillingAddress && i.billFromBank === item.billFromBank)) {
            acc.push(item);
        }
        return acc;
    }, []);
    AllInfo[1] = AllInfo[1].concat(JSON.parse(localStorage.getItem('AllInfo'))[1]).reduce((acc, item) => {
        if (!acc.some(i => i.billToNip === item.billToNip && i.billTo === item.billTo && i.billToAddress === item.billToAddress && i.billToPhone === item.billToPhone && i.billToEmail === item.billToEmail && i.billToBillingAddress === item.billToBillingAddress && i.billToBank === item.billToBank)) {
            acc.push(item);
        }
        return acc;
    }, []);
    AllInfo[2] = AllInfo[2].concat(JSON.parse(localStorage.getItem('AllInfo'))[2]).reduce((acc, item) => {
        if (!acc.some(i => i.billRecipientNip === item.billRecipientNip && i.billRecipient === item.billRecipient && i.billRecipientAddress === item.billRecipientAddress && i.billRecipientPhone === item.billRecipientPhone && i.billRecipientEmail === item.billRecipientEmail && i.billRecipientBillingAddress === item.billRecipientBillingAddress && i.billRecipientBank === item.billRecipientBank)) {
            acc.push(item);
        }
        return acc;
    }, []);

    if (JSON.parse(localStorage.getItem('AllInfo')).length > 3) AllInfo[3].lastInvoiceNumber = JSON.parse(localStorage.getItem('AllInfo'))[3].lastInvoiceNumber;
}

localStorage.setItem('AllInfo', JSON.stringify(AllInfo));

    if (localStorage.getItem('Invoices') !== null) {
        Invoices = Invoices.concat(JSON.parse(localStorage.getItem('Invoices'))).reduce((acc, item) => {
            if (!acc.some(i => i.invoiceNumber === item.invoiceNumber)) {
                acc.push(item);
            }
            else if (acc.some(i => i.invoiceNumber === item.invoiceNumber && i.dateModified < item.dateModified)){
                acc = acc.filter(i => i.invoiceNumber !== item.invoiceNumber);
                acc.push(item);
            }
            return acc;
        }, []);
    }
    localStorage.setItem('Invoices', JSON.stringify(Invoices));


const dt = new Date();
let mm = dt.getMonth() + 1;
if (mm < 10) mm = '0' + mm;
let dd = dt.getDate();
if (dd < 10) dd = '0' + dd;
const yyyy = dt.getFullYear();
const format = yyyy + '-' + mm + '-' + dd;


class InvoiceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: 'zł',
            paymentMethod: 'Gotówka',
            invoiceNumber: 'FS ' + (JSON.parse(localStorage.getItem('AllInfo'))[3].lastInvoiceNumber+1) + '/' + yyyy,
            dateOfIssue: format,
            dueDate: format,
            dateOfIssueF: '',
            dueDateF: '',
            placeOfIssue: "Jejkowice",

            taxAmount: 0,
            discountAmount: 0,
            taxAmountInd: {"__html": "<span class=\"fw-bold float-end\" >0.00 zł</span>"},
            discountAmountInd: {"__html": "<span class=\"fw-bold float-end\" >0.00 zł</span>"},


            billFromNip:            AllInfo[0][1].billFromNip,
            billFrom:               AllInfo[0][1].billFrom,
            billFromAddress:        AllInfo[0][1].billFromAddress,
            billFromPhone:          AllInfo[0][1].billFromPhone,
            billFromEmail:          AllInfo[0][1].billFromEmail,
            billFromBillingAddress: AllInfo[0][1].billFromBillingAddress,
            billFromBank:           AllInfo[0][1].billFromBank,

            billToNip: '',
            billTo: '',
            billToAddress: '',
            billToPhone: '',
            billToEmail: '',
            billToBillingAddress: '',
            billToBank: '',

            billRecipientNip: '',
            billRecipient: '',
            billRecipientAddress: '',
            billRecipientPhone: '',
            billRecipientEmail: '',
            billRecipientBillingAddress: '',
            billRecipientBank: '',

            notes: '',
            total: '0.00',
            subTotal: '0.00',
        };
        this.state.items = [{
            id: '',
            number: 1,
            name: '',
            PKWiU: '',
            netPrice: 0,
            netValue: 0,
            tax: 0,
            taxAmount: 0,
            discount: 0,
            discountAmount: 0,
            grossValue: 0,
            description: '',
            quantity: 1,
            hasDescription: false
        }];
        this.handleCalculateTotal();
        this.editField = this.editField.bind(this);
        this.listRef = React.createRef();
    }

    componentDidMount() {
        this.handleCalculateTotal()
    }
    handleRowDel(items) {
        let index = this.state.items.indexOf(items);
        this.state.items.splice(index, 1);
        this.setState(this.state.items)
    };
    handleAddEvent() {
        let id = Date.now().toString();
        let number = this.state.items.length + 1;
        let items = {
            id: id,
            number: number,
            name: '',
            PKWiU: '',
            netPrice: 0,
            netValue: 0,
            tax: 0,
            taxAmount: 0,
            discount: 0,
            discountAmount: 0,
            grossValue: 0,
            description: '',
            quantity: 1,
            hasDescription: false
        };
        this.state.items.push(items);
        this.setState(this.state.items);
    }
    addZeros(number) {
        if(number%1 === 0) {
            return number.toString() + '.00';
        } else if(number*10%1 === 0) {
            return number.toString() + '0';
        } else {
            return number.toString();
        }
    }
    diffToHtml(items, TotalValue, namePercent, nameAmount) {
        let percent = [];
        let amount = [];
        let output = "";

        for (let i = 0; i < items.length; i++) {
            if (percent.includes(items[i][namePercent])) {
                let index = percent.indexOf(items[i][namePercent]);
                amount[index] = items[i][nameAmount] + amount[index];
            } else {
                percent.push(items[i][namePercent]);
                amount.push(items[i][nameAmount]);
            }
        }
        let list = [];
        for (let j = 0; j < percent.length; j++) {
            list.push({'percent': percent[j], 'amount': amount[j]});
        }
        list.sort(function(a, b) {
            return ((b.percent < a.percent) ? -1 : ((b.percent === a.percent) ? 0 : 1));
        });
        for (let k = 0; k < list.length; k++) {
            percent[k] = list[k].percent;
            amount[k] = list[k].amount;
        }
        for (let i = 0; i < percent.length; i++) {
            if (percent[i] === 0) {
                continue;
            }
            output = output + '<br><span class="float-end text-nowrap"> (' + percent[i] + '%)&nbsp;&nbsp;&nbsp-&nbsp;&nbsp;&nbsp;' + this.addZeros(Math.round(amount[i]*100+Number.EPSILON)/100) + ' ' + this.state.currency + '</span>';
        }
        output = '<span class="fw-bold float-end" >'+ TotalValue + ' ' + this.state.currency + '</span>' + output;

        return {__html: output};
    }
    handleCalculateTotal() {
        let items = this.state.items;
        let subTotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        let total = 0;
        items.map(function(items) {
            subTotal = items.netValue + subTotal;
            taxAmount = items.taxAmount + taxAmount;
            discountAmount = items.discountAmount + discountAmount;
            total = subTotal + taxAmount;
            return (subTotal, taxAmount, discountAmount, total);
        });

        subTotal = Math.round(subTotal * 100 + Number.EPSILON) / 100;
        taxAmount = Math.round(taxAmount * 100 + Number.EPSILON) / 100;
        discountAmount = Math.round(discountAmount * 100 + Number.EPSILON) / 100;
        total = Math.round(total * 100 + Number.EPSILON) / 100;

        this.setState({
            subTotal: this.addZeros(subTotal),
        }, () => {
            this.setState({
                taxAmountInd: this.diffToHtml(items, this.addZeros(taxAmount), "tax", "taxAmount"),
            }, () => {
                this.setState({
                    discountAmountInd: this.diffToHtml(items, this.addZeros(discountAmount), "discount", "discountAmount"),
                }, () => {
                    this.setState({
                        total: this.addZeros(total),
                    }, () => {
                        this.setState({
                            taxAmount: taxAmount,
                        }, () => {
                            this.setState({
                                discountAmount: discountAmount,
                            })
                        })
                    });
                });
            });
        });

    };
    onItemizedItemEdit(evt) {
        let item = {
            id: evt.target.id,
            name: evt.target.name,
            value: evt.target.value
        };
        let items = this.state.items.slice();
        let newItems = items.map(function (items) {
            for (let key in items) {
                if (key === item.name && items.id === item.id) {
                    items[key] = item.value;
                }
            }
            return items;
        });
        this.setState({items: newItems});

        let tempKey = items.map(function (items) {
            for (let key in items) {
                if (key === item.name && items.id === item.id) {
                    items[key] = item.value;
                    return key;
                }
            }
            return items;
        });

        for (let i = 0; i < items.length; i++) {
            items[i].number = i + 1;
            if (items[i].id === item.id) {
                // Changing value only if it's field wasn't changed
                items[i].hasDescription = items[i].description !== '';

                    if (tempKey[i] === 'discount' || tempKey[i] === 'quantity' || tempKey[i] === 'netPrice') {

                    if (items[i].discount === '') items[i].discount = '0';
                    items[i].discount = parseInt(items[i].discount);
                    if (items[i].quantity === '') items[i].quantity = '1';
                    items[i].quantity = parseInt(items[i].quantity);
                    if (items[i].netPrice === '') items[i].netPrice = '0';
                    items[i].netPrice = parseFloat(items[i].netPrice);

                    items[i].netValue = Math.round((items[i].netPrice * items[i].quantity * (1 - items[i].discount/100)+ Number.EPSILON) * 100) / 100;
                    items[i].discountAmount = Math.round((items[i].netPrice * items[i].quantity * (items[i].discount/100)+ Number.EPSILON) * 100) / 100;
                    items[i].taxAmount = Math.round((items[i].netValue *  (items[i].tax/100) + Number.EPSILON) * 100) / 100;
                    items[i].grossValue = Math.round((items[i].netValue + items[i].taxAmount+ Number.EPSILON) * 100) / 100;
                }
                if (tempKey[i] === 'netValue') {

                    if (items[i].netValue === '') items[i].netValue = '0';
                    items[i].netValue = parseFloat(items[i].netValue);

                    items[i].netPrice = Math.round((items[i].netValue * (1 + items[i].discount / (100 - items[i].discount)) / items[i].quantity+ Number.EPSILON) * 100) / 100;
                    items[i].taxAmount = Math.round((items[i].netValue *  (items[i].tax/100) + Number.EPSILON) * 100) / 100;
                    items[i].grossValue = Math.round((items[i].netValue + items[i].taxAmount+ Number.EPSILON) * 100) / 100;
                }
                if (tempKey[i] === 'tax') {

                    if (items[i].tax === '') items[i].tax = '0';
                    items[i].tax = parseInt(items[i].tax);

                    items[i].taxAmount = Math.round((items[i].netValue *  (items[i].tax/100) + Number.EPSILON) * 100) / 100;
                    items[i].grossValue = Math.round((items[i].netValue + items[i].taxAmount+ Number.EPSILON) * 100) / 100;
                }
                if (tempKey[i] === 'grossValue') {

                    if (items[i].grossValue === '') items[i].grossValue = '0';
                    items[i].grossValue = parseFloat(items[i].grossValue);

                    items[i].netValue = Math.round((items[i].grossValue / (1 + items[i].tax / 100) + Number.EPSILON) * 100) / 100;
                    items[i].taxAmount = Math.round((items[i].grossValue - items[i].netValue+ Number.EPSILON) * 100) / 100;
                    items[i].netPrice = Math.round((items[i].netValue * (1 + items[i].discount / (100 - items[i].discount)) / items[i].quantity + Number.EPSILON) * 100) / 100;
                }
            }
        }

        this.handleCalculateTotal();
    };
    editField = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
        this.handleCalculateTotal();
    };
    onCurrencyChange = (selectedOption) => {
        this.setState(selectedOption);
    };
    onPaymentMethodChange = (selectedOption) => {
        this.setState(selectedOption);
    }

    removeElements = () => {
        const items = this.listRef.current.querySelectorAll('.list-items');
        items.forEach((item) => {
            item.remove();
        });
    };
    displayList = (list, sortType, orderBy, description, who) => {
        let sortedList;
        if (sortType === 'text') {
            sortedList = list.sort((a, b) => (a[orderBy] > b[orderBy]) ? 1 : (b[orderBy] > a[orderBy]) ? -1 : 0);
        } else if (sortType === 'number') {
            sortedList = list.sort((a, b) => a[orderBy] - b[orderBy]);
        }
        this.removeElements();
        sortedList.forEach((i) => {
            if (i[orderBy].toLowerCase().startsWith(this.state[orderBy].toLowerCase())) {
                const listItem = document.createElement('li');
                listItem.classList.add('list-items');
                listItem.style.cursor = 'pointer';
                listItem.style.listStyle = 'none';
                listItem.style.padding = '1px';
                listItem.style.minHeight = '10px';
                listItem.style.borderRadius = '7px';
                listItem.onmouseover = () => {listItem.style.backgroundColor = '#f2f2f2';};
                listItem.onmouseout = () => {listItem.style.backgroundColor = 'white';};
                listItem.onclick = () => this.displayNames(i, who);

                let word = `<b>${i[orderBy].substring(0, this.state[orderBy].length)}</b>`;
                word += i[orderBy].substring(this.state[orderBy].length);
                word += `<p style="color: #575757; font-size: 10px; margin: 0;">${i[description]}</p>`;
                listItem.innerHTML = word;
                this.listRef.current.appendChild(listItem);
            }
        });
    };
    displayNames = (value, who) => {
        this.removeElements();
        if (who === "From"){
            this.setState({billFromNip: value.billFromNip})
            this.setState({billFrom: value.billFrom})
            this.setState({billFromAddress: value.billFromAddress})
            this.setState({billFromPhone: value.billFromPhone})
            this.setState({billFromEmail: value.billFromEmail})
            this.setState({billFromBillingAddress: value.billFromBillingAddress})
            this.setState({billFromBank: value.billFromBank})
        }
        if (who === "To"){
            this.setState({billToNip: value.billToNip})
            this.setState({billTo: value.billTo})
            this.setState({billToAddress: value.billToAddress})
            this.setState({billToPhone: value.billToPhone})
            this.setState({billToEmail: value.billToEmail})
            this.setState({billToBillingAddress: value.billToBillingAddress})
            this.setState({billToBank: value.billToBank})
        }
        if (who === "Recipient"){
            this.setState({billRecipientNip: value.billRecipientNip})
            this.setState({billRecipient: value.billRecipient})
            this.setState({billRecipientAddress: value.billRecipientAddress})
            this.setState({billRecipientPhone: value.billRecipientPhone})
            this.setState({billRecipientEmail: value.billRecipientEmail})
            this.setState({billRecipientBillingAddress: value.billRecipientBillingAddress})
            this.setState({billRecipientBank: value.billRecipientBank})
        }
    };

    checkIfNew = () => {
        let from = {
            billFromNip: this.state.billFromNip,
            billFrom: this.state.billFrom,
            billFromAddress: this.state.billFromAddress,
            billFromPhone: this.state.billFromPhone,
            billFromEmail: this.state.billFromEmail,
            billFromBillingAddress: this.state.billFromBillingAddress,
            billFromBank: this.state.billFromBank,
        };
        for(let i = 0; i < AllInfo[0].length; i++){
            if (JSON.stringify(AllInfo[0][i]) === JSON.stringify(from)){
                break;
            }
            else {
                if (i === AllInfo[0].length - 1){
                    AllInfo[0].push(from);
                }
            }
        }
        let to = {
            billToNip: this.state.billToNip,
            billTo: this.state.billTo,
            billToAddress: this.state.billToAddress,
            billToPhone: this.state.billToPhone,
            billToEmail: this.state.billToEmail,
            billToBillingAddress: this.state.billToBillingAddress,
            billToBank: this.state.billToBank,
        }
        for(let i = 0; i < AllInfo[1].length; i++){
            if (JSON.stringify(AllInfo[1][i]) === JSON.stringify(to)){
                break;
            }
            else {
                if (i === AllInfo[1].length - 1){
                    AllInfo[1].push(to);
                }
            }
        }
        let recipient = {
            billRecipientNip: this.state.billRecipientNip,
            billRecipient: this.state.billRecipient,
            billRecipientAddress: this.state.billRecipientAddress,
            billRecipientPhone: this.state.billRecipientPhone,
            billRecipientEmail: this.state.billRecipientEmail,
            billRecipientBillingAddress: this.state.billRecipientBillingAddress,
            billRecipientBank: this.state.billRecipientBank,
        }
        for(let i = 0; i < AllInfo[2].length; i++){
            if (JSON.stringify(AllInfo[2][i]) === JSON.stringify(recipient)){
                break;
            }
            else {
                if (i === AllInfo[2].length - 1){
                    AllInfo[2].push(recipient);
                }
            }
        }
        localStorage.setItem('AllInfo', JSON.stringify(AllInfo));
    }
    makeInvoice = () => {
        return {
            currency: this.state.currency,
            paymentMethod: this.state.paymentMethod,
            invoiceNumber: this.state.invoiceNumber,
            dateOfIssue: this.state.dateOfIssue,
            dueDate: this.state.dueDate,
            placeOfIssue: this.state.placeOfIssue,

            billFromNip: this.state.billFromNip,
            billFrom: this.state.billFrom,
            billFromAddress: this.state.billFromAddress,
            billFromPhone: this.state.billFromPhone,
            billFromEmail: this.state.billFromEmail,
            billFromBillingAddress: this.state.billFromBillingAddress,
            billFromBank: this.state.billFromBank,

            billToNip: this.state.billToNip,
            billTo: this.state.billTo,
            billToAddress: this.state.billToAddress,
            billToPhone: this.state.billToPhone,
            billToEmail: this.state.billToEmail,
            billToBillingAddress: this.state.billToBillingAddress,
            billToBank: this.state.billToBank,

            billRecipientNip: this.state.billRecipientNip,
            billRecipient: this.state.billRecipient,
            billRecipientAddress: this.state.billRecipientAddress,
            billRecipientPhone: this.state.billRecipientPhone,
            billRecipientEmail: this.state.billRecipientEmail,
            billRecipientBillingAddress: this.state.billRecipientBillingAddress,
            billRecipientBank: this.state.billRecipientBank,

            notes: this.state.notes,
            dateModified: Date.now().toString(),

            items: this.state.items,
        };
    }

    saveInvoice = (AllInfo) => {
        for(let i = 0; i < Invoices.length; i++){
            if(Invoices[i].invoiceNumber === this.state.invoiceNumber){
                let invoice = this.makeInvoice();
                invoice.dateModified = Invoices[i].dateModified;
                if (JSON.stringify(Invoices[i]) !== JSON.stringify(invoice)){
                    if (window.confirm("Faktura z tym numerem już istnieje. Chcesz ją nadpisać?")){
                        Invoices[i] = this.makeInvoice()
                        localStorage.setItem('Invoices', JSON.stringify(Invoices));
                        AllInfo[3].lastInvoiceNumber = parseInt(this.state.invoiceNumber.split("/")[0].split(" ")[1]);
                        localStorage.setItem('AllInfo', JSON.stringify(AllInfo));
                    }
                    else {
                        setTimeout(() => {
                            this.setState({isOpen: false})
                        }, 10);
                    }
                }
                break;
            }
            else if (i === Invoices.length - 1){
                Invoices.push(this.makeInvoice());
                localStorage.setItem('Invoices', JSON.stringify(Invoices));

                AllInfo[3].lastInvoiceNumber = parseInt(this.state.invoiceNumber.split("/")[0].split(" ")[1]);
                localStorage.setItem('AllInfo', JSON.stringify(AllInfo));
                break;
            }
        }


    }

    download(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    import() {
        const input = document.createElement('input');
        input.type = 'file';
        input.click();
        input.onchange = e => {
            const file = e.target.files[0];
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.readAsText(file,'UTF-8');
                reader.onload = readerEvent => {
                    let content = readerEvent.target.result;
                    content = JSON.parse(content.toString());

                    if (localStorage.getItem('AllInfo') !== null) {
                        content[0] = content[0].concat(JSON.parse(localStorage.getItem('AllInfo'))[0]).reduce((acc, item) => {
                            if (!acc.some(i => i.billFromNip === item.billFromNip && i.billFrom === item.billFrom && i.billFromAddress === item.billFromAddress && i.billFromPhone === item.billFromPhone && i.billFromEmail === item.billFromEmail && i.billFromBillingAddress === item.billFromBillingAddress && i.billFromBank === item.billFromBank)) {
                                acc.push(item);
                            }
                            return acc;
                        }, []);
                        content[1] = content[1].concat(JSON.parse(localStorage.getItem('AllInfo'))[1]).reduce((acc, item) => {
                            if (!acc.some(i => i.billToNip === item.billToNip && i.billTo === item.billTo && i.billToAddress === item.billToAddress && i.billToPhone === item.billToPhone && i.billToEmail === item.billToEmail && i.billToBillingAddress === item.billToBillingAddress && i.billToBank === item.billToBank)) {
                                acc.push(item);
                            }
                            return acc;
                        }, []);
                        content[2] = content[2].concat(JSON.parse(localStorage.getItem('AllInfo'))[2]).reduce((acc, item) => {
                            if (!acc.some(i => i.billRecipientNip === item.billRecipientNip && i.billRecipient === item.billRecipient && i.billRecipientAddress === item.billRecipientAddress && i.billRecipientPhone === item.billRecipientPhone && i.billRecipientEmail === item.billRecipientEmail && i.billRecipientBillingAddress === item.billRecipientBillingAddress && i.billRecipientBank === item.billRecipientBank)) {
                                acc.push(item);
                            }
                            return acc;
                        }, []);
                        AllInfo[3].lastInvoiceNumber = Math.max(AllInfo[3].lastInvoiceNumber, content[3].lastInvoiceNumber);
                    }
                    localStorage.setItem('AllInfo', JSON.stringify(content));
                    AllInfo[0] = JSON.parse(localStorage.getItem('AllInfo'))[0];
                    AllInfo[1] = JSON.parse(localStorage.getItem('AllInfo'))[1];
                    AllInfo[2] = JSON.parse(localStorage.getItem('AllInfo'))[2];
                    AllInfo[3] = JSON.parse(localStorage.getItem('AllInfo'))[3];
                }
            }
        }
    }
    importInvoices() {
        const input = document.createElement('input');
        input.type = 'file';
        input.click();
        input.onchange = e => {
            const file = e.target.files[0];
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.readAsText(file,'UTF-8');
                reader.onload = readerEvent => {
                    let content = readerEvent.target.result;
                    content = JSON.parse(content.toString());

                    if (localStorage.getItem('Invoices') !== null) {
                        content = content.concat(JSON.parse(localStorage.getItem('Invoices'))).reduce((acc, item) => {
                            if (!acc.some(i => i.invoiceNumber === item.invoiceNumber)) {
                                acc.push(item);
                            }
                            else if (acc.some(i => i.invoiceNumber === item.invoiceNumber && i.dateModified < item.dateModified)){
                                acc = acc.filter(i => i.invoiceNumber !== item.invoiceNumber);
                                acc.push(item);
                            }
                            return acc;
                        }, []);
                    }
                    Invoices = content;
                    localStorage.setItem('Invoices', JSON.stringify(content));

                }
            }
        }
    }


    loadInvoice = (invoice) => {
        this.setState({
            currency: invoice.currency,
            paymentMethod: invoice.paymentMethod,
            invoiceNumber: invoice.invoiceNumber,
            dateOfIssue: invoice.dateOfIssue,
            dueDate: invoice.dueDate,
            placeOfIssue: invoice.placeOfIssue,

            billFromNip: invoice.billFromNip,
            billFrom: invoice.billFrom,
            billFromAddress: invoice.billFromAddress,
            billFromPhone: invoice.billFromPhone,
            billFromEmail: invoice.billFromEmail,
            billFromBillingAddress: invoice.billFromBillingAddress,
            billFromBank: invoice.billFromBank,

            billToNip: invoice.billToNip,
            billTo: invoice.billTo,
            billToAddress: invoice.billToAddress,
            billToPhone: invoice.billToPhone,
            billToEmail: invoice.billToEmail,
            billToBillingAddress: invoice.billToBillingAddress,
            billToBank: invoice.billToBank,

            billRecipientNip: invoice.billRecipientNip,
            billRecipient: invoice.billRecipient,
            billRecipientAddress: invoice.billRecipientAddress,
            billRecipientPhone: invoice.billRecipientPhone,
            billRecipientEmail: invoice.billRecipientEmail,
            billRecipientBillingAddress: invoice.billRecipientBillingAddress,
            billRecipientBank: invoice.billRecipientBank,

            notes: invoice.notes,
            items: JSON.parse(JSON.stringify(invoice.items)),

        })
        setTimeout(() => {
            this.handleCalculateTotal();
        }, 100);

    }

    onBeforeModal = () => {
        this.setState({
            dueDateF: (this.state.dueDate).substring(8,10) + '.' + (this.state.dueDate).substring(5,7) + '.' + (this.state.dueDate).substring(0,4),
        })
        this.setState({
            dateOfIssueF: (this.state.dateOfIssue).substring(8,10) + '.' + (this.state.dateOfIssue).substring(5,7) + '.' + (this.state.dateOfIssue).substring(0,4),
        })
    }
    openModal = (event) => {
        event.preventDefault()
        this.handleCalculateTotal()
        this.setState({isOpen: true})
    };
    closeModal = () => this.setState({isOpen: false});

    openInvoices = () => this.setState({isInvoicesOpen: true})

    closeInvoices = () => this.setState({isInvoicesOpen: false});



    render() {
        return (
            <Form onSubmit={(event) => {this.checkIfNew(); this.onBeforeModal(); this.saveInvoice(AllInfo); this.openModal(event)}}>
                <Row>
                    <Col md={8} lg={9}>
                        <Card className="p-4 p-xl-5 my-3 my-xl-4">
                            <Row>
                                <Col md={7}>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex flex-row align-items-center mb-2">
                                            <span className="fw-bold d-block">Data&nbsp;wystawienia:&nbsp;</span>
                                            <Form.Control type="date" value={this.state.dateOfIssue} name={"dateOfIssue"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px'}} required="required"/>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-row align-items-center mb-2">
                                        <span className="fw-bold d-block">Termin&nbsp;płatności:&nbsp;</span>
                                        <Form.Control type="date" value={this.state.dueDate} name={"dueDate"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px'}} required="required"/>
                                    </div>
                                    <div className="d-flex flex-row align-items-center mb-2">
                                        <span className="fw-bold d-block">Miejsce&nbsp;wystawienia:&nbsp;</span>
                                        <Form.Control type="text" value={this.state.placeOfIssue} name={"placeOfIssue"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px'}} required="required"/>
                                    </div>
                                </Col>
                                 <Col md={5}>
                                    <div className="d-flex flex-row align-items-center justify-content-md-end mb-2">
                                        <span className="fw-bold">Numer&nbsp;faktury:&nbsp;</span>
                                        <Form.Control type="text" value={this.state.invoiceNumber} name={"invoiceNumber"} onChange={(event) => this.editField(event)} min="1" style={{maxWidth: '150px'}} required="required"/>
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-4"/>
                            <Row className="mb-3">
                                <Col md={12} lg={3}>
                                    <span className="fw-bold">Podpowiedzi:</span>
                                    <ul id="list" style={{paddingLeft: 0}}  ref={this.listRef} />
                                </Col>
                                <Col md={12} lg={3}>
                                    <Form.Label className="fw-bold">Sprzedawca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                    value={this.state.billFromNip}                 type="text"  name="billFromNip"                 className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'number', 'billFromNip',                 'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'number', 'billFromNip',                 'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nazwa firmy sprzedawcy"} value={this.state.billFrom}                    type="text"  name="billFrom"                    className="my-2" autoComplete="Name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'text',   'billFrom',                    'billFromAddress',      "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'text',   'billFrom',                    'billFromAddress',      "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Adres firmy sprzedawcy"} value={this.state.billFromAddress}             type="text"  name="billFromAddress"             className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'text',   'billFromAddress',             'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'text',   'billFromAddress',             'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nr telefonu sprzedawcy"} value={this.state.billFromPhone}               type="text"  name="billFromPhone"               className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'number', 'billFromPhone',               'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'number', 'billFromPhone',               'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email sprzedawcy"} value={this.state.billFromEmail}               type="email" name="billFromEmail"               className="my-2" autoComplete="Email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'text',   'billFromEmail',               'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'text',   'billFromEmail',               'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}    value={this.state.billFromBillingAddress}      type="text"  name="billFromBillingAddress"      className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'number', 'billFromBillingAddress',      'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'number', 'billFromBillingAddress',      'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                   value={this.state.billFromBank}                type="text"  name="billFromBank"                className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[0],      'text',   'billFromBank',                'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(AllInfo[0],      'text',   'billFromBank',                'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                </Col>
                                <Col md={12} lg={3}>
                                    <Form.Label className="fw-bold">Nabywca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                    value={this.state.billToNip}                   type="text"  name="billToNip"                   className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'number', 'billToNip',                   'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'number', 'billToNip',                   'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nazwa firmy nabywcy"}    value={this.state.billTo}                      type="text"  name="billTo"                      className="my-2" autoComplete="name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'text',   'billTo',                      'billToAddress',        "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'text',   'billTo',                      'billToAddress',        "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Adres firmy nabywcy"}    value={this.state.billToAddress}               type="text"  name="billToAddress"               className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'text',   'billToAddress',               'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'text',   'billToAddress',               'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nr telefonu nabywcy"}    value={this.state.billToPhone}                 type="text"  name="billToPhone"                 className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'number', 'billToPhone',                 'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'number', 'billToPhone',                 'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email nabywcy"}    value={this.state.billToEmail}                 type="email" name="billToEmail"                 className="my-2" autoComplete="email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'text',   'billToEmail',                 'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'text',   'billToEmail',                 'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}    value={this.state.billToBillingAddress}        type="text"  name="billToBillingAddress"        className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'number', 'billToBillingAddress',        'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'number', 'billToBillingAddress',        'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                   value={this.state.billToBank}                  type="text"  name="billToBank"                  className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[1],        'text',   'billToBank',                  'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(AllInfo[1],        'text',   'billToBank',                  'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                </Col>
                                <Col md={12} lg={3}>
                                    <Form.Label className="fw-bold">Odbiorca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                    value={this.state.billRecipientNip}            type="text"  name="billRecipientNip"            className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'number', 'billRecipientNip',            'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'number', 'billRecipientNip',            'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Nazwa firmy nabywcy"}    value={this.state.billRecipient}               type="text"  name="billRecipient"               className="my-2" autoComplete="name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'text',   'billRecipient',               'billRecipientAddress', "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'text',   'billRecipient',               'billRecipientAddress', "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres firmy nabywcy"}    value={this.state.billRecipientAddress}        type="text"  name="billRecipientAddress"        className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'text',   'billRecipientAddress',        'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'text',   'billRecipientAddress',        'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Nr telefonu nabywcy"}    value={this.state.billRecipientPhone}          type="text"  name="billRecipientPhone"          className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'number', 'billRecipientPhone',          'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'number', 'billRecipientPhone',          'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email nabywcy"}    value={this.state.billRecipientEmail}          type="email" name="billRecipientEmail"          className="my-2" autoComplete="email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'text',   'billRecipientEmail',          'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'text',   'billRecipientEmail',          'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}    value={this.state.billRecipientBillingAddress} type="text"  name="billRecipientBillingAddress" className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'number', 'billRecipientBillingAddress', 'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'number', 'billRecipientBillingAddress', 'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                   value={this.state.billRecipientBank}           type="text"  name="billRecipientBank"           className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(AllInfo[2], 'text',   'billRecipientBank',           'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(AllInfo[2], 'text',   'billRecipientBank',           'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                </Col>
                            </Row>
                            <InvoiceItem onItemizedItemEdit={this.onItemizedItemEdit.bind(this)} onRowAdd={this.handleAddEvent.bind(this)} onRowDel={this.handleRowDel.bind(this)} currency={this.state.currency} items={this.state.items}/>
                            <Row className="mt-4 justify-content-end">
                                <Col lg={6}>
                                    <div className="d-flex flex-row align-items-start justify-content-between">
                                        <span className="fw-bold">Suma&nbsp;częściowa:</span>
                                        <span className="fw-bold">{this.state.subTotal} {this.state.currency}</span>
                                    </div>
                                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                                        <span className="fw-bold">Rabat:</span>
                                        <div dangerouslySetInnerHTML={this.state.discountAmountInd} />
                                    </div>
                                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                                        <span className="fw-bold">Wartość&nbsp;podatku&nbsp;VAT:</span>
                                        <div dangerouslySetInnerHTML={this.state.taxAmountInd} />
                                    </div>
                                    <hr/>
                                    <div className="d-flex flex-row align-items-start justify-content-between" style={{fontSize: '1.125rem'}}>
                                        <span className="fw-bold">Łącznie:</span>
                                        <span className="fw-bold">{this.state.total || 0} {this.state.currency}</span>
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-4"/>
                            <Form.Label className="fw-bold">Dodatkowe&nbsp;informacje:</Form.Label>
                            <Form.Control placeholder="" name="notes" value={this.state.notes} onChange={(event) => this.editField(event)} as="textarea" className="my-2" rows={1}/>
                        </Card>
                    </Col>
                    <Col md={4} lg={3}>
                        <div className="sticky-top pt-md-3 pt-xl-4">
                            <Button variant="primary" type="submit" className="d-block w-100">Sprawdź poprawność faktury, kliknięcie zapisze nowe dane i zatwierdzi numer faktury</Button>
                            <InvoiceModal showModal={this.state.isOpen} closeModal={this.closeModal} info={this.state} items={this.state.items} currency={this.state.currency} subTotal={this.state.subTotal} taxAmount={this.state.taxAmount} taxAmountInd={this.state.taxAmountInd} discountAmount={this.state.discountAmount} discountAmountInd={this.state.discountAmountInd} total={this.state.total}/>
                            <ShowInvoices showInvoices={this.state.isInvoicesOpen} closeInvoices={this.closeInvoices} invoices={Invoices} editInvoice={this.loadInvoice} addZeros={this.addZeros}></ShowInvoices>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Waluta:</Form.Label>
                                <Form.Select onChange={(event) => {this.onCurrencyChange({currency: event.target["value"]}); this.handleCalculateTotal()}} className="btn btn-light my-1" aria-label="Change Currency">
                                    <option value="zł">PLN (Polski Złoty)</option>
                                    <option value="$">USD (United States Dollar)</option>
                                    <option value="£">GBP (British Pound Sterling)</option>
                                    <option value="¥">JPY (Japanese Yen)</option>
                                    <option value="$">CAD (Canadian Dollar)</option>
                                    <option value="$">AUD (Australian Dollar)</option>
                                    <option value="$">SGD (Singapore Dollar)</option>
                                    <option value="¥">CNY (Chinese Renminbi)</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Forma płatności:</Form.Label>
                                <Form.Select onChange={event => this.onPaymentMethodChange({paymentMethod: event.target["value"]})} className="btn btn-light my-1" aria-label="Change Payment Method" defaultValue={"Karta płatnicza"}>
                                    <option value="Gotówka">Gotówka</option>
                                    <option value="Karta płatnicza">Karta płatnicza</option>
                                    <option value="Przelew">Przelew</option>
                                </Form.Select>
                            </Form.Group>
                            <hr className="my-4"/>
                            <Button variant="outline-primary" type="button" className="d-block w-100 mb-3" onClick={() => this.openInvoices()}>Zobacz faktury</Button>
                            <hr className="my-4"/>
                            <Button variant="outline-secondary" type="button" className="d-block w-100 mb-3" onClick={() => this.download('FakturyExport ' + format + '.txt', JSON.stringify(Invoices))}>Eksportuj Faktury</Button>
                            <Button variant="outline-secondary" type="button" className="d-block w-100 mb-3" onClick={() => this.importInvoices()}>Importuj Faktury</Button>
                            <hr className="my-4"/>
                            <Button variant="outline-secondary" type="button" className="d-block w-100 mb-3" onClick={() => this.download('Export ' + format + '.txt', JSON.stringify(AllInfo))}>Eksportuj dane</Button>
                            <Button variant="outline-secondary" type="button" className="d-block w-100 mb-3" onClick={() => this.import()}>Importuj dane</Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default InvoiceForm;

