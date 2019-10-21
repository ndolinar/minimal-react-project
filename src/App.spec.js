import React from 'react';
import renderer from 'react-test-renderer';
import App, { Counter, dataReducer } from './App';
import { mount } from 'enzyme';
import axios from 'axios';

const list = ['a', 'b', 'c'];

const consoleError = console.error;
beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation((...args) => {
		if (!args[0].includes('Warning: An update to %s inside a test was not wrapped in act')) {
			consoleError(...args);
		}
	});
});

describe('App', () => {
	describe('Reducer', () => {
		it('should set a list', () => {
			const state = { list: [], error: null };
			const newState = dataReducer(state, { type: 'SET_LIST', list });
			expect(newState).toEqual({ list, error: null });
		});

		it('should reset the error if list is set', () => {
			const state = { list: [], error: true };
			const newState = dataReducer(state, { type: 'SET_LIST', list });
			expect(newState.error).toEqual(null);
		});

		it('should set the error', () => {
			const state = { list: [], error: null };
			const newState = dataReducer(state, { type: 'SET_ERROR' });
			expect(newState.error).toBeTruthy();
		});
	});

	test('snapshot renders', () => {
		const tree = renderer.create(<App />).toJSON();

		expect(tree).toMatchSnapshot();
	});

	it('renders the inner Counter', () => {
		const wrap = mount(<App />);
		expect(wrap.find(Counter).length).toEqual(1);
	});

	it('passes all props to Counter', () => {
		const wrap = mount(<App />);
		const counterWrap = wrap.find(Counter);
		expect(counterWrap.find('p').text()).toEqual('0');
	});

	it('increments the counter', () => {
		const wrap = mount(<App />);
		wrap
			.find('button')
			.at(0)
			.simulate('click');
		const counterWrap = wrap.find(Counter);
		expect(counterWrap.find('p').text()).toBe('1');
	});

	it('decrements the counter', () => {
		const wrap = mount(<App />);
		wrap
			.find('button')
			.at(1)
			.simulate('click');
		const counterWrap = wrap.find(Counter);
		expect(counterWrap.find('p').text()).toBe('-1');
	});

	it('fetches async data', () => {
		const promise = new Promise((resolve, reject) =>
			setTimeout(
				() =>
					resolve({
						data: {
							hits: [
								{ objectID: '0', title: 'z' },
								{ objectID: '1', title: 'a' },
								{ objectID: '2', title: 'b' },
							],
						},
					}),
				100
			)
		);

		axios.get = jest.fn(() => promise);
		const wrapper = mount(<App />);

		return promise.then(() => {
			wrapper.update();
			expect(wrapper.find('li').length).toEqual(3);
			axios.get.mockClear();
		});
	});
}); // describe App

describe('Counter', () => {
	test('snapshot renders', () => {
		const tree = renderer.create(<Counter counter={1} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
