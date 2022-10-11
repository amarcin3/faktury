import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class EditableField extends React.Component {
  render() {
    return (
      <InputGroup className="my-1 flex-nowrap">

        <Form.Control
          className={this.props.cellData.textAlign}
          type={this.props.cellData.type}
          placeholder={this.props.cellData.placeholder}
          min={this.props.cellData.min}

          number={this.props.cellData.number}
          name={this.props.cellData.name}
          pkwiu={this.props.cellData.PKWiU}
          tax={this.props.cellData.tax}
          discount={this.props.cellData.discount}
          netprice={this.props.cellData.netPrice}
          netvalue={this.props.cellData.netValue}
          grossvalue={this.props.cellData.grossValue}

          id={this.props.cellData.id}
          value={this.props.cellData.value}
          step={this.props.cellData.step}
          presicion={this.props.cellData.precision}
          aria-label={this.props.cellData.name}
          onChange={this.props.onItemizedItemEdit}
          //required
        />

      </InputGroup>
    );
  }
}

export default EditableField;
