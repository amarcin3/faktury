import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import { BiPaperPlane, BiCloudDownload } from "react-icons/bi";
import html2canvas from 'html2canvas';
import JsPDF from 'jspdf'

function GenerateInvoice() {
    html2canvas(document.querySelector("#invoiceCapture"),{scale: 2}).then((canvas) => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new JsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [612, 792]
        });
        pdf.internal.scaleFactor = 1;
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        //show pdf in browser
        pdf.output('dataurlnewwindow', 'Faktura.pdf');
        //pdf.save('Faktura.pdf');
    });
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
                                <h5 className="fw-bold text-secondary"> {this.props.currency} {this.props.total}</h5>
                            </div>
                        </div>
                        <div className="p-4">
                            <Row className="mb-4">
                                <Row className="mb-4">
                                    <Col md={4}>
                                        <div className="fw-bold mt-2">Data wystawienia:</div>
                                        <div>{this.props.info.dateOfIssueF}</div>
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
                                <Col md={4}>
                                    <div className="fw-bold">Odbiorca:</div>
                                    <div>{this.props.info.billRecipientNip||''}</div>
                                    <div>{this.props.info.billRecipient||''}</div>
                                    <div>{this.props.info.billRecipientAddress||''}</div>
                                    <div>{this.props.info.billRecipientPhone||''}</div>
                                    <div>{this.props.info.billRecipientEmail||''}</div>
                                    <div>{this.props.info.billRecipientBillingAddress||''}</div>
                                    <div>{this.props.info.billRecipientBank||''}</div>
                                </Col>
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
                                            <td className="text-center" style={{width: '0px'}}>{addZeros(item.netPrice)}&nbsp;{this.props.currency}</td>
                                            <td className="text-center" style={{width: '0px'}}> {addZeros(item.netValue)}{this.props.currency}</td>
                                            <td className="text-center" style={{width: '0px'}}> {item.tax}</td>
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
                                    <td className="text-end" style={{width: '100px'}}>{this.props.subTotal}&nbsp;{this.props.currency}</td>
                                </tr>
                                    <tr className="text-end">
                                        <td></td>
                                        <td className="fw-bold" style={{width: '100px'}}>Rabat: </td>
                                        <td><div dangerouslySetInnerHTML={this.props.discountAmountInd} /></td>
                                    </tr>
                                    <tr className="text-end">
                                        <td></td>
                                        <td className="fw-bold" style={{width: '100px'}}>Podatek</td>
                                        <td> <div dangerouslySetInnerHTML={this.props.taxAmountInd} /></td>
                                    </tr>
                                <tr className="text-end">
                                    <td></td>
                                    <td className="fw-bold" style={{width: '100px'}}>Łącznie: </td>
                                    <td className="text-end" style={{width: '100px'}}>{this.props.total}&nbsp;{this.props.currency}</td>
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
                                <Button variant="primary" className="d-block w-100" onClick={GenerateInvoice}>
                                    <BiPaperPlane style={{width: '15px', height: '15px', marginTop: '-3px'}} className="me-2"/>Wyślij&nbsp;fakturę
                                </Button>
                            </Col>
                            <Col md={6}>
                                <Button variant="outline-primary" className="d-block w-100 mt-3 mt-md-0" onClick={GenerateInvoice}>
                                    <BiCloudDownload style={{width: '16px', height: '16px', marginTop: '-3px'}} className="me-2"/>
                                    Pobierz&nbsp;PDF
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
