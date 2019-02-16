import React from 'react';
import { Link } from 'react-router-dom';
import SearchResult from './SearchResult';

export default class SearchResultList extends React.Component {
    state = {
        fade: 'in',
    }

    getSearchResults = () => {
        const items = this.props.data.results;
        return items.map((item, index) => {
            return <SearchResult key={index} itemData={item} filter={this.props.urlValues.filter} getProperUrl={this.getProperUrl} handleLinkClick={this.handleLinkClick}/>
        })
    }

    getResultCountString = () => {
        const count = this.props.data.count;
        if (count === 0) {
            return `No results found for "${this.props.urlValues.q}" in ${this.props.urlValues.filter}`;
        } else {
            return `Showing ${count} results for "${this.props.urlValues.q}" in ${this.props.urlValues.filter}`;
        }
    }

    getProperUrl = (url) => {
        return url.replace(`https://swapi.co/api`, '');
    }

    handleLinkClick = (event, url) => {
        event.preventDefault();
        this.setState({fade: 'out'}, () => setTimeout(() => { this.props.history.push(url) }, 500));
    }

    render() {
        return (
            <div className={`transition__fade-${this.state.fade}`}>
                <section className="search-result__header">
                    <h2>{this.props.urlValues.q}</h2>
                    <p className="search-result__count">{this.getResultCountString()}</p>
                </section>
                <ul>
                    {this.getSearchResults()}
                </ul>
                <Link to="/" className="go-back-link"><i className="fas fa-angle-left"></i> Go back</Link>
            </div>
        );
    }
}