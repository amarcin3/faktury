import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


class ShowInvoices extends React.Component {
    render() {
        return(
            <div>
                <Modal show={this.props.showInvoices} onHide={this.props.closeInvoices} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Wybierz fakturę do edycji</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                        {this.props.invoices.map((invoice, index) => {
                            if(index !== 0) {
                                let total = 0;
                                invoice.items.map((item) => {
                                    total += item.grossValue;
                                    return null;
                                })
                                return (
                                    <Col md={12} lg={3} key={index}>
                                        <Button variant="outline-primary" className="d-block w-100 mb-2" onClick={() => {this.props.editInvoice(invoice); this.props.closeInvoices();}}>
                                            {invoice.invoiceNumber}
                                            <hr className="my-2"/>
                                            {(invoice.dateOfIssue).substring(8,10) + '.' + (invoice.dateOfIssue).substring(5,7) + '.' + (invoice.dateOfIssue).substring(0,4) + "r. "}
                                            {invoice.placeOfIssue}
                                            <hr className="my-2"/>
                                            {"Nabywca: " + invoice.billTo}
                                            <hr className="my-2"/>
                                            {"Łączna należność: "}{this.props.addZeros(total) + invoice.currency}</Button>
                                    </Col>
                                )
                            }
                            else if (this.props.invoices.length === 1) {
                                return (
                                    <Row key={index}>
                                        <Col>
                                            <h5>Nie ma żadnych faktur</h5>
                                        </Col>
                                    </Row>
                                )
                            }
                            else {
                                return null;
                            }
                        })}
                        </Row>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}
export default ShowInvoices;