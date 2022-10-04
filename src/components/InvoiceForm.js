import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import InputGroup from 'react-bootstrap/InputGroup';

class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      currency: 'zł',
      currentDate: '',
      invoiceNumber: 1,
      dateOfIssue: '',

      billToNip: '',
      billTo: '',
      billToAddress: '',
      billToPhone: '',
      billToEmail: '',
      billToBillingAddress: '',
      billToBank: '',

      billFromNip: '',
      billFrom: '',
      billFromAddress: '',
      billFromPhone: '',
      billFromEmail: '',
      billFromBillingAddress: '',
      billFromBank: '',

      notes: '',
      total: '0.00',
      subTotal: '0.00',
      taxRate: '',
      taxAmount: '0.00',
      discountRate: '',
      discountAmount: '0.00'
    };
    this.state.items = [
      {
        id: '',
        name: '',
        description: '',
        price: '1.00',
        quantity: 1
      }
    ];
    this.editField = this.editField.bind(this);
  }
  componentDidMount(prevProps) {
    this.handleCalculateTotal()
  }
  handleRowDel(items) {
    var index = this.state.items.indexOf(items);
    this.state.items.splice(index, 1);
    this.setState(this.state.items);
  };
  handleAddEvent() {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var items = {
      id: id,
      name: '',
      price: '1.00',
      description: '',
      quantity: 1
    }
    this.state.items.push(items);
    this.setState(this.state.items);
    console.log(this.state.items);
  }
  handleCalculateTotal() {
    var items = this.state.items;
    console.log(this.state.items.length);
    var subTotal = 0;

    items.map(function(items) {
      subTotal = parseFloat(parseFloat(subTotal + (parseFloat(items.price).toFixed(2) * parseInt(items.quantity))).toFixed(2));
      return subTotal;
    });

    this.setState({
      subTotal: parseFloat(subTotal)//.toFixed(2)
    }, () => {
      this.setState({
        taxAmmount: parseFloat(parseFloat(subTotal) * (this.state.taxRate / 100)).toFixed(2).toString()
      }, () => {
        this.setState({
          discountAmmount: parseFloat(parseFloat(subTotal) * (this.state.discountRate / 100)).toFixed(2).toString()
        }, () => {
          this.setState({
            total: ((subTotal - this.state.discountAmmount) + parseFloat(this.state.taxAmmount)).toFixed(2)
          });
        });
      });
    });

  };
  onItemizedItemEdit(evt) {
    var item = {
      id: evt.target.id,
      name: evt.target.name,
      value: evt.target.value
    };
    var items = this.state.items.slice();
    var newItems = items.map(function(items) {
      for (var key in items) {
        if (key === item.name && items.id === item.id) {
          items[key] = item.value;
        }
      }
      return items;
    });
    this.setState({items: newItems});
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
  openModal = (event) => {
    event.preventDefault()
    this.handleCalculateTotal()
    this.setState({isOpen: true})
  };
  closeModal = (event) => this.setState({isOpen: false});
  render() {
    return (<Form onSubmit={this.openModal}>
      <Row>
        <Col md={8} lg={9}>
          <Card className="p-4 p-xl-5 my-3 my-xl-4">
            <div className="d-flex flex-row align-items-start justify-content-between mb-3">
              <div class="d-flex flex-column">
                <div className="d-flex flex-column">
                  <div class="mb-2">
                    <span className="fw-bold">Data&nbsp;wystawienia:&nbsp;</span>
                    <span className="current-date">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="d-flex flex-row align-items-center">
                  <span className="fw-bold d-block me-2">Termin&nbsp;płatności:&nbsp;</span>
                  <Form.Control type="date" value={this.state.dateOfIssue} name={"dateOfIssue"} onChange={(event) => this.editField(event)} style={{
                      maxWidth: '150px'
                    }} required="required"/>
                </div>
              </div>
              <div className="d-flex flex-row align-items-center">
                <span className="fw-bold me-2">Numer&nbsp;faktury:&nbsp;</span>
                <Form.Control type="number" value={this.state.invoiceNumber} name={"invoiceNumber"} onChange={(event) => this.editField(event)} min="1" style={{
                    maxWidth: '70px'
                  }} required="required"/>
              </div>
            </div>
            <hr className="my-4"/>
            <Row className="mb-5">
              <Col>
                <Form.Label className="fw-bold">Sprzedawca:</Form.Label>
                <Form.Control placeholder={"NIP"}                             value={this.state.billFromNip}            type="text"  name="billFromNip"            className="my-2" autoComplete="Nip"            onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Nazwa firmy sprzedawcy"} rows={3} value={this.state.billFrom}               type="text"  name="billFrom"               className="my-2" autoComplete="Name"           onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Adres firmy sprzedawcy"}          value={this.state.billFromAddress}        type="text"  name="billFromAddress"        className="my-2" autoComplete="Address"        onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Nr telefonu sprzedawcy"}          value={this.state.billFromPhone}          type="text"  name="billFromPhone"          className="my-2" autoComplete="Phone"          onChange={(event) => this.editField(event)}/*required="required"*//>
                <Form.Control placeholder={"Adres email sprzedawcy"}          value={this.state.billFromEmail}          type="email" name="billFromEmail"          className="my-2" autoComplete="Email"          onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Adres rozliczeniowy"}             value={this.state.billFromBillingAddress} type="text"  name="billFromBillingAddress" className="my-2" autoComplete="BillingAddress" onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Bank"}                            value={this.state.billFromBank}           type="text"  name="billFromBank"           className="my-2" autoComplete="Bank"           onChange={(event) => this.editField(event)}/>
              </Col>
              <Col>
                <Form.Label className="fw-bold">Nabywca:</Form.Label>
                <Form.Control placeholder={"NIP"}                          value={this.state.billToNip}              type="text"  name="billToNip"            className="my-2" autoComplete="Nip"              onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Nazwa firmy nabywcy"} rows={3} value={this.state.billTo}                 type="text"  name="billTo"               className="my-2" autoComplete="name"             onChange={(event) => this.editField(event)} />
                <Form.Control placeholder={"Adres firmy nabywcy"}          value={this.state.billToAddress}          type="text"  name="billToAddress"        className="my-2" autoComplete="Address"          onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Nr telefonu nabywcy"}          value={this.state.billToPhone}            type="text"  name="billToPhone"          className="my-2" autoComplete="Phone"            onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Adres email nabywcy"}          value={this.state.billToEmail}            type="email" name="billToEmail"          className="my-2" autoComplete="email"            onChange={(event) => this.editField(event)} />
                <Form.Control placeholder={"Adres rozliczeniowy"}          value={this.state.billToBillingAddress}   type="text"  name="billToBillingAddress" className="my-2" autoComplete="BillingAddress"   onChange={(event) => this.editField(event)}/>
                <Form.Control placeholder={"Bank"}                         value={this.state.billToBank}             type="text"  name="billToBank"           className="my-2" autoComplete="Bank"             onChange={(event) => this.editField(event)}/>
              </Col>
            </Row>
            <InvoiceItem onItemizedItemEdit={this.onItemizedItemEdit.bind(this)} onRowAdd={this.handleAddEvent.bind(this)} onRowDel={this.handleRowDel.bind(this)} currency={this.state.currency} items={this.state.items}/>
            <Row className="mt-4 justify-content-end">
              <Col lg={6}>
                <div className="d-flex flex-row align-items-start justify-content-between">
                  <span className="fw-bold">Suma&nbsp;częściowa:
                  </span>
                  <span>{this.state.subTotal}
                    {this.state.currency}</span>
                </div>
                <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                  <span className="fw-bold">Zniżka:</span>
                  <span>
                    <span className="small ">({this.state.discountRate || 0}%)&nbsp;</span>
                    {this.state.discountAmmount || 0}
                    {this.state.currency}</span>
                </div>
                <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                  <span className="fw-bold">Podatek&nbsp;VAT:
                  </span>
                  <span>
                    <span className="small ">({this.state.taxRate || 0}%)&nbsp;</span>
                    {this.state.taxAmmount || 0}
                    {this.state.currency}</span>
                </div>
                <hr/>
                <div className="d-flex flex-row align-items-start justify-content-between" style={{
                    fontSize: '1.125rem'
                  }}>
                  <span className="fw-bold">Łącznie:
                  </span>
                  <span className="fw-bold">{this.state.total || 0}
                    {this.state.currency}
                    </span>
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
            <InvoiceModal showModal={this.state.isOpen} closeModal={this.closeModal} info={this.state} items={this.state.items} currency={this.state.currency} subTotal={this.state.subTotal} taxAmmount={this.state.taxAmmount} discountAmmount={this.state.discountAmmount} total={this.state.total}/>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Waluta:</Form.Label>
              <Form.Select onChange={event => this.onCurrencyChange({currency: event.target.value})} className="btn btn-light my-1" aria-label="Change Currency">
                <option value="zł">PLN (Polski Złoty)</option>
                <option value="$">USD (United States Dollar)</option>
                <option value="£">GBP (British Pound Sterling)</option>
                <option value="¥">JPY (Japanese Yen)</option>
                <option value="$">CAD (Canadian Dollar)</option>
                <option value="$">AUD (Australian Dollar)</option>
                <option value="$">SGD (Signapore Dollar)</option>
                <option value="¥">CNY (Chinese Renminbi)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Tax rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control name="taxRate" type="number" value={this.state.taxRate} onChange={(event) => this.editField(event)} className="bg-white border" placeholder="0.0" min="0.00" step="0.01" max="100.00"/>
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Discount rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control name="discountRate" type="number" value={this.state.discountRate} onChange={(event) => this.editField(event)} className="bg-white border" placeholder="0.0" min="0.00" step="0.01" max="100.00"/>
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </div>
        </Col>
      </Row>
    </Form>)
  }
}

export default InvoiceForm;
