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
import FromInfo from './FromInfo.json';
import ToInfo from './ToInfo.json';
import RecipientInfo from './RecipientInfo.json';

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
            isOpen: false,
            currency: 'zł',
            paymentMethod: 'Karta płatnicza',
            currentDate: '',
            invoiceNumber: '1',
            dateOfIssue: format,
            dueDate: format,
            dateOfIssueF: '',
            dueDateF: '',
            placeOfIssue: "Jejkowice",

            taxAmount: 0,
            discountAmount: 0,
            taxAmountInd: {"__html": "<span class=\"fw-bold float-end\" >0.00 zł</span>"},
            discountAmountInd: {"__html": "<span class=\"fw-bold float-end\" >0.00 zł</span>"},


            billFromNip: FromInfo[0].billFromNip,
            billFrom: FromInfo[0].billFrom,
            billFromAddress: FromInfo[0].billFromAddress,
            billFromPhone: FromInfo[0].billFromPhone,
            billFromEmail: FromInfo[0].billFromEmail,
            billFromBillingAddress: FromInfo[0].billFromBillingAddress,
            billFromBank: FromInfo[0].billFromBank,

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
        let id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
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

                //console.log(items);

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
    displayList = (list, sortType, orderby, description, who) => {
        let sortedList;
        if (sortType === 'text') {
            sortedList = list.sort((a, b) => (a[orderby] > b[orderby]) ? 1 : (b[orderby] > a[orderby]) ? -1 : 0);
        } else if (sortType === 'number') {
            sortedList = list.sort((a, b) => a[orderby] - b[orderby]);
        }
        this.removeElements();
        sortedList.forEach((i) => {
            if (i[orderby].toLowerCase().startsWith(this.state[orderby].toLowerCase())) {
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

                let word = `<b>${i[orderby].substring(0, this.state[orderby].length)}</b>`;
                word += i[orderby].substring(this.state[orderby].length);
                word += `<p style="color: #575757; font-size: 10px; margin: 0;">${i[description]}</p>`;
                listItem.innerHTML = word;
                this.listRef.current.appendChild(listItem);
            }
        });
    };
    displayNames = (value, who) => {
        this.removeElements();
        this.setState({ podp1: value.podp1 });
        this.setState({ podp2: value.podp2 });
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
    render() {
        return (
            <Form onSubmit={(event) => {this.onBeforeModal(); this.openModal(event)}}>
                <Row>
                    <Col md={8} lg={9}>
                        <Card className="p-4 p-xl-5 my-3 my-xl-4">
                            <div className="d-flex flex-row align-items-start justify-content-between mb-3">
                                <div className="d-flex flex-column">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex flex-row align-items-center">
                                            <span className="fw-bold d-block me-2">Data&nbsp;wystawienia:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <Form.Control type="date" value={this.state.dateOfIssue} name={"dateOfIssue"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px', marginBottom: '10px'}} required="required"/>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-row align-items-center">
                                        <span className="fw-bold d-block me-2">Termin&nbsp;płatności:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <Form.Control type="date" value={this.state.dueDate} name={"dueDate"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px', marginBottom: '10px'}} required="required"/>
                                    </div>
                                    <div className="d-flex flex-row align-items-center">
                                        <span className="fw-bold d-block me-2">Miejsce&nbsp;wystawienia:&nbsp;</span>
                                        <Form.Control type="text" value={this.state.placeOfIssue} name={"placeOfIssue"} onChange={(event) => this.editField(event)} style={{maxWidth: '150px'}} required="required"/>
                                    </div>
                                </div>
                                <div className="d-flex flex-row align-items-center">
                                    <span className="fw-bold me-2">Numer&nbsp;faktury:&nbsp;</span>
                                    <Form.Control type="text" value={this.state.invoiceNumber} name={"invoiceNumber"} onChange={(event) => this.editField(event)} min="1" style={{maxWidth: '70px'}} required="required"/>
                                </div>
                            </div>
                            <hr className="my-4"/>
                            <Row className="mb-5">
                                <Col>
                                    <span className="fw-bold">Podpowiedzi:</span>
                                    <ul id="list" style={{paddingLeft: 0}}  ref={this.listRef} />
                                </Col>
                                <Col>
                                    <Form.Label className="fw-bold">Sprzedawca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                             value={this.state.billFromNip}                 type="text"  name="billFromNip"                 className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'number', 'billFromNip',                 'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'number', 'billFromNip',                 'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nazwa firmy sprzedawcy"} rows={3} value={this.state.billFrom}                    type="text"  name="billFrom"                    className="my-2" autoComplete="Name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'text',   'billFrom',                    'billFromAddress',      "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'text',   'billFrom',                    'billFromAddress',      "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Adres firmy sprzedawcy"}          value={this.state.billFromAddress}             type="text"  name="billFromAddress"             className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'text',   'billFromAddress',             'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'text',   'billFromAddress',             'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nr telefonu sprzedawcy"}          value={this.state.billFromPhone}               type="text"  name="billFromPhone"               className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'number', 'billFromPhone',               'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'number', 'billFromPhone',               'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email sprzedawcy"}          value={this.state.billFromEmail}               type="email" name="billFromEmail"               className="my-2" autoComplete="Email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'text',   'billFromEmail',               'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'text',   'billFromEmail',               'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}             value={this.state.billFromBillingAddress}      type="text"  name="billFromBillingAddress"      className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'number', 'billFromBillingAddress',      'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'number', 'billFromBillingAddress',      'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                            value={this.state.billFromBank}                type="text"  name="billFromBank"                className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(FromInfo,      'text',   'billFromBank',                'billFrom',             "From"     )} onFocus={() => setTimeout(() => this.displayList(FromInfo,      'text',   'billFromBank',                'billFrom',             "From"     ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                </Col>
                                <Col>
                                    <Form.Label className="fw-bold">Nabywca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                             value={this.state.billToNip}                   type="text"  name="billToNip"                   className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'number', 'billToNip',                   'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'number', 'billToNip',                   'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nazwa firmy nabywcy"} rows={3}    value={this.state.billTo}                      type="text"  name="billTo"                      className="my-2" autoComplete="name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'text',   'billTo',                      'billToAddress',        "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'text',   'billTo',                      'billToAddress',        "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Adres firmy nabywcy"}             value={this.state.billToAddress}               type="text"  name="billToAddress"               className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'text',   'billToAddress',               'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'text',   'billToAddress',               'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} required="required"/>
                                    <Form.Control placeholder={"Nr telefonu nabywcy"}             value={this.state.billToPhone}                 type="text"  name="billToPhone"                 className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'number', 'billToPhone',                 'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'number', 'billToPhone',                 'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email nabywcy"}             value={this.state.billToEmail}                 type="email" name="billToEmail"                 className="my-2" autoComplete="email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'text',   'billToEmail',                 'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'text',   'billToEmail',                 'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}             value={this.state.billToBillingAddress}        type="text"  name="billToBillingAddress"        className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'number', 'billToBillingAddress',        'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'number', 'billToBillingAddress',        'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                            value={this.state.billToBank}                  type="text"  name="billToBank"                  className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(ToInfo,        'text',   'billToBank',                  'billTo',               "To"       )} onFocus={() => setTimeout(() => this.displayList(ToInfo,        'text',   'billToBank',                  'billTo',               "To"       ), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                </Col>
                                <Col>
                                    <Form.Label className="fw-bold">Odbiorca:</Form.Label>
                                    <Form.Control placeholder={"NIP"}                             value={this.state.billRecipientNip}            type="text"  name="billRecipientNip"            className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'number', 'billRecipientNip',            'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'number', 'billRecipientNip',            'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Nazwa firmy nabywcy"} rows={3}    value={this.state.billRecipient}               type="text"  name="billRecipient"               className="my-2" autoComplete="name"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'text',   'billRecipient',               'billRecipientAddress', "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'text',   'billRecipient',               'billRecipientAddress', "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres firmy nabywcy"}             value={this.state.billRecipientAddress}        type="text"  name="billRecipientAddress"        className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'text',   'billRecipientAddress',        'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'text',   'billRecipientAddress',        'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Nr telefonu nabywcy"}             value={this.state.billRecipientPhone}          type="text"  name="billRecipientPhone"          className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'number', 'billRecipientPhone',          'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'number', 'billRecipientPhone',          'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres email nabywcy"}             value={this.state.billRecipientEmail}          type="email" name="billRecipientEmail"          className="my-2" autoComplete="email"          onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'text',   'billRecipientEmail',          'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'text',   'billRecipientEmail',          'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Adres rozliczeniowy"}             value={this.state.billRecipientBillingAddress} type="text"  name="billRecipientBillingAddress" className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'number', 'billRecipientBillingAddress', 'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'number', 'billRecipientBillingAddress', 'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
                                    <Form.Control placeholder={"Bank"}                            value={this.state.billRecipientBank}           type="text"  name="billRecipientBank"           className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)} onKeyUp={() => this.displayList(RecipientInfo, 'text',   'billRecipientBank',           'billRecipient',        "Recipient")} onFocus={() => setTimeout(() => this.displayList(RecipientInfo, 'text',   'billRecipientBank',           'billRecipient',        "Recipient"), 0)} onBlur={() => {setTimeout(() => {if (document.activeElement.name !== undefined && document.activeElement.name.startsWith("bill")) this.removeElements(); else {setTimeout(() => {this.removeElements();}, 200);}}, 0);}} />
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
                            <Button variant="primary" type="submit" className="d-block w-100">Sprawdź poprawność faktury</Button>
                            <InvoiceModal showModal={this.state.isOpen} closeModal={this.closeModal} info={this.state} items={this.state.items} currency={this.state.currency} subTotal={this.state.subTotal} taxAmount={this.state.taxAmount} taxAmountInd={this.state.taxAmountInd} discountAmount={this.state.discountAmount} discountAmountInd={this.state.discountAmountInd} total={this.state.total}/>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Waluta:</Form.Label>
                                <Form.Select onChange={(event) => {this.onCurrencyChange({currency: event.target.value}); this.handleCalculateTotal()}} className="btn btn-light my-1" aria-label="Change Currency">
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
                                <Form.Select onChange={event => this.onPaymentMethodChange({paymentMethod: event.target.value})} className="btn btn-light my-1" aria-label="Change Payment Method" defaultValue={"Karta płatnicza"}>
                                    <option value="Czek">Czek (0 dni; 100%)</option>
                                    <option value="Częściowy kredyt 14 dni">Częściowy kredyt 14 dni (14 dni; 50%)</option>
                                    <option value="Częściowy kredyt 7 dni">Częściowy kredyt 7 dni (7 dni; 50%)</option>
                                    <option value="Gotówka">Gotówka (0 dni; 100%)</option>
                                    <option value="Karta płatnicza">Karta płatnicza (0 dni; 100%)</option>
                                    <option value="Kredyt 14 dni">Kredyt 14 dni (14 dni; 0%)</option>
                                    <option value="Kredyt 7 dni">Kredyt 7 dni (7 dni; 0%)</option>s
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default InvoiceForm;
