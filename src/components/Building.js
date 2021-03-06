import React from 'react';
import PropTypes from 'prop-types';
import smallCookie from '../img/perfectCookie-small.png';
import { getFromDatabase } from '../indexedDB/methods';
import { databaseName, databaseVersion } from '../indexedDB/setup';

class Building extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      buttonClass: 'store_panel__building',
      cost: this.props.data.initialCost,
      cookiesPerSecond: this.props.data.productionPerSecond,
      isShown: false,
    };
    const openDatabase = indexedDB.open(databaseName, databaseVersion);
    openDatabase.onsuccess = (event) => {
      const database = event.target.result;
      const request = getFromDatabase(database, props.data.name);

      request.onsuccess = (data) => {
        if (!data.target.result) return;
        const amount = Number(data.target.result.buildingAmount);
        const cost = Number(data.target.result.buildingCost);
        this.setState(() => ({
          amount,
          cost,
        }));
      };
    };
  }

  componentWillReceiveProps = () => {
    const hiddenButtonClass = 'store_panel__building store_panel__building--hidden';
    if (
      this.props.cookiesAmount < this.state.cost &&
      hiddenButtonClass !== this.state.buttonClass
    ) {
      this.setState(() => ({
        buttonClass: hiddenButtonClass,
        isShown: false,
      }));
    } else if (
      this.props.cookiesAmount >= this.state.cost &&
      hiddenButtonClass === this.state.buttonClass
    ) {
      this.setState(() => ({
        buttonClass: 'store_panel__building',
        isShown: true,
      }));
    }
  }

  onMouseDown = () => {
    if (!this.state.isShown) return;
    this.setState(() => ({
      buttonClass: 'store_panel__building--clicked',
    }));
  }

  onMouseUp = () => {
    if (!this.state.isShown) return;
    this.setState(() => ({
      buttonClass: 'store_panel__building',
    }));
  }

  getInfoPanel = () => {
    const {
      name, description, productionPerSecond,
    } = this.props.data;

    const stats = {
      name,
      amount: this.state.amount,
      cost: this.state.cost,
      description,
      productionPerSecond,
      areEnoughCookies: this.state.isShown,
      onHover: true,
    };

    this.props.getInfoPanel(stats);
  }

  buyBuilding = () => {
    if (this.props.cookiesAmount < this.state.cost) return;
    this.setState(prevState => ({
      amount: prevState.amount + 1,
    }), () => {
      this.props.buildingBought(this.state.cost, this.state.cookiesPerSecond);
      this.increaseCost();
      this.getInfoPanel();
    });
  }

  increaseCost = () => {
    const cost = Math.floor(this.state.cost * 1.15);
    this.setState(() =>
      ({
        cost,
        isShown: cost < this.props.cookiesAmount - cost,
      }), () => this.getInfoPanel());
  }

  render() {
    return (
      <button
        className={this.state.buttonClass}
        onClick={this.buyBuilding}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={this.getInfoPanel}
      >
        <div>
          <p className="store_panel__building_name">{this.props.data.name}</p>
          <p className="store_panel__building_cost">
            <img src={`./public/${smallCookie}`} alt="Cookie.png" />
            {` ${this.state.cost}`}
          </p>
        </div>
        <p className="store_panel__building_amount">{this.state.amount}</p>
      </button>
    );
  }
}

Building.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
  cookiesAmount: PropTypes.number.isRequired,
  buildingBought: PropTypes.func.isRequired,
  getInfoPanel: PropTypes.func.isRequired,
};

export default Building;
