import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { BiTrash } from "react-icons/bi";
import EditableField from './EditableField';

class InvoiceItem extends React.Component {
    render() {
        let onItemizedItemEdit = this.props.onItemizedItemEdit;
        let currency = this.props.currency;
        let rowDel = this.props.onRowDel;
        let itemTable = this.props.items.map(function (item) {
            return (
                <ItemRow onItemizedItemEdit={onItemizedItemEdit} item={item} onDelEvent={rowDel.bind(this)} key={item.id} currency={currency}/>
            )
        });
        return (
            <div>
                <div className="table-responsive mb-3">
                    <Table className="table">
                        <thead>
                            <tr>
                                <th>Lp.</th>
                                <th>Nazwa/opis produktu</th>
                                <th>Ilość</th>
                                <th>PKWiU</th>
                                <th>Rabat [%]</th>
                                <th>Cena jednostkowa [zł]</th>
                                <th>Wartość netto [zł]</th>
                                <th>Podatek VAT [%]</th>
                                <th>Wartość brutto [zł]</th>
                                <th className="text-center">Usuń</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemTable}
                        </tbody>
                    </Table>
                </div>
                <Button className="fw-bold" onClick={(event) => {this.props.onRowAdd(); this.props.onItemizedItemEdit(event)}}>Dodaj produkt</Button>
            </div>
        );
    }
}

class ItemRow extends React.Component {
    onDelEvent() {
        this.props.onDelEvent(this.props.item);
    }
    render() {
        return (
            <tr>
                <td style={{minWidth: '43px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "text",
                            name: "number",
                            textAlign: "text-center",
                            required: "required",
                            value: this.props.item.number,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{width: '100%'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "text",
                            name: "name",
                            placeholder: "Nazwa produktu",
                            required: "required",
                            value: this.props.item.name,
                            id: this.props.item.id,
                        }}
                    />

                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "text",
                            name: "description",
                            placeholder: "Opis produktu",
                            value: this.props.item.description,
                            id: this.props.item.id
                        }}
                    />
                </td>

                <td style={{minWidth: '70px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "quantity",
                            min: 1,
                            step: "1",
                            required: "required",
                            value: this.props.item.quantity,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{minWidth: '70px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "text",
                            name: "PKWiU",
                            placeholder: "PKWiU",
                            value: this.props.item.PKWiU,
                            id: this.props.item.id
                        }}
                    />
                </td>

                <td style={{minWidth: '75px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "discount",
                            min: 0,
                            step: "1",
                            precision: 2,
                            textAlign: "text-end",
                            required: "required",
                            value: this.props.item.discount,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{minWidth: '100px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "netPrice",
                            min: "0.00",
                            step: "0.01",
                            precision: 2,
                            textAlign: "text-end",
                            value: this.props.item.netPrice,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{minWidth: '100px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "netValue",
                            step: "0.01",
                            min: 0,
                            precision: 2,
                            textAlign: "text-end",
                            value: this.props.item.netValue,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{minWidth: '75px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "tax",
                            min: 0,
                            step: "1",
                            precision: 2,
                            textAlign: "text-end",
                            value: this.props.item.tax,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td style={{minWidth: '100px'}}>
                    <EditableField
                        onItemizedItemEdit={this.props.onItemizedItemEdit} cellData={{
                            type: "number",
                            name: "grossValue",
                            step: "0.01",
                            min: 0,
                            precision: 2,
                            textAlign: "text-end",
                            value: this.props.item.grossValue,
                            id: this.props.item.id,
                        }}
                    />
                </td>

                <td className="text-center" style={{minWidth: '50px'}}>
                    <BiTrash onClick={(event) => {this.onDelEvent(); this.props.onItemizedItemEdit(event)}} style={{height: '33px', width: '33px', padding: '7.5px'}} className="text-white mt-1 btn btn-danger"/>
                </td>
            </tr>
        );
    }
}

export default InvoiceItem;
