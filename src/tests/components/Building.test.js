import React from 'react';
import { shallow } from 'enzyme';
import Building from '../../components/Building';
import buildings from '../../settings/buildings';

let buildingBought;
let data;
let wrapper;

beforeEach(() => {
  buildingBought = jest.fn();
  [data] = buildings;
  wrapper = shallow(<Building
    data={data}
    cookiesAmount={25}
    buildingBought={buildingBought}
  />);
});

test('should render Building', () => {
  expect(wrapper).toMatchSnapshot();
});

test('should buy building', () => {
  wrapper.find('button').simulate('click');
  expect(wrapper.state('amount')).toBe(1);
  expect(wrapper.state('cost')).toBe(17);
  expect(buildingBought)
    .toHaveBeenLastCalledWith(data.initialCost, wrapper.state('cookiesPerSecond'));
});

test('should not buy building', () => {
  wrapper.setProps({ cookiesAmount: 0 });
  wrapper.find('button').simulate('click');
  expect(wrapper.state('amount')).toBe(0);
  expect(wrapper.state('cost')).toBe(15);
  expect(buildingBought)
    .not
    .toHaveBeenCalled();
});