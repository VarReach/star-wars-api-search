import React from 'react';
import LoadingView from '../LoadingView/LoadingView';
import queryString from 'query-string';
import './SearchView.css';

import SearchResultList from './SearchResultList/SearchResultList';
import makeCancelable from '../../PromiseHelp';

export default class SearchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            data: {},
        }
    }

    //holds promise so it can be canceled when unmounted
    cancelablePromise = null;
    cancelablePromiseAll = null;

    componentDidMount() {
        this.mounted = true;
        const values = queryString.parse(this.props.location.search);
        this.setState({urlValues: {filter: values.filter, q: values.q}}, () => {this.makeFetchRequest()});
    }

    componentWillUnmount() {
        this.cancelablePromise && this.cancelablePromise.cancel();
        this.cancelablePromiseAll && this.cancelablePromiseAll.cancel();
    }

    //makes sure the data is updated before attempting to render!
    updateData = (data) => {
        this.setState({data}, () => { this.setState({loading: false}) });
    }

    makeFetchRequest = () => {
        const url = `https://swapi.co/api/${this.state.urlValues.filter}/?search=${this.state.urlValues.q}`;
        const options = {
            method: 'GET',
            headers: {
            'content-type': 'application/json'
            }
        };
        this.cancelablePromise = makeCancelable(fetch(url, options));
        this.cancelablePromise
            .promise
            .then(response => {
                if (!response.ok) {
                    return response.json().then(e => Promise.reject(e));
                }
                return response.json();
            })
            .then(respJson => {
                //if multiple GET requests are needed
                if (respJson.count > 10) {
                    this.cancelablePromiseAll = makeCancelable(this.getAllFetchPages(url, options, respJson))
                    this.cancelablePromiseAll
                        .promise
                        .then(allRespJson => {
                            this.updateData(allRespJson);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                //end of multiple requests
                } else {
                    this.updateData(respJson);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    getAllFetchPages = (url, options, respJson) => {
        const promises = [];
        for (let i = 2; i <= (respJson.count/10); i++) {
            const pageUrl = url + `&page=${i}`;
            promises.push(fetch(pageUrl, options))
        }
        return Promise.all(promises)
            .then(respAll => {
                respAll.forEach(result => {
                    if (!result.ok) {
                        return result.json().then(e => Promise.reject(e));
                    }
                });
                return Promise.all(
                    respAll.map(result => result.json())
                );
            })
            .then(respAllJson => {
                respAllJson.forEach(resp => {
                    respJson.results.push(...resp.results)
                })
                return respJson;
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        return (
            <>
                {this.state.loading ? <LoadingView /> : <SearchResultList history={this.props.history} urlValues={this.state.urlValues} data={this.state.data}/>}
            </>
        );
    }
}