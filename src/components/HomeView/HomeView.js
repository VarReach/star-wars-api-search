import React from 'react';
import './HomeView.css';

export default class HomeView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fade: 'in',
        }
        this.searchInput = React.createRef();
        this.filterInput = React.createRef();
    }

    handleOnFocus = (event, focusIn) => {
        const target = event.target;
        const form = target.parentElement;
        focusIn ? form.classList.add('focused') : form.classList.remove('focused');
    }

    handleOnSubmit = (event) => {
        event.preventDefault();
        const searchInput = this.searchInput.current.value;
        const filterType = this.filterInput.current.value;
        this.setState({fade: 'out'}, () => setTimeout(() => { this.props.history.push(`/search?filter=${filterType}&q=${searchInput}`) }, 500));
    }

    render() {
        return (
            <form className={`home-search__form transition__fade-${this.state.fade}`} onSubmit={(e => this.handleOnSubmit(e))}>
                <i className="home-search__search-icon fas fa-search"></i>
                <input type="text" placeholder="Search the database..." className="home-search__input" name="search-input" onFocus={(e) => this.handleOnFocus(e, true)} onBlur={(e) => this.handleOnFocus(e)} ref={this.searchInput}/>
                <select className="home-search__type" onFocus={(e) => this.handleOnFocus(e, true)} onBlur={(e) => this.handleOnFocus(e)} ref={this.filterInput} defaultValue="" required> 
                    <option value="" disabled>Select your filter</option>
                    <option value="films">Films</option>
                    <option value="people">People</option>
                    <option value="planets">Planets</option>
                    <option value="species">Species</option>
                    <option value="starships">Starships</option>
                    <option value="vehicles">Vehicles</option>
                </select>
                <button type="submit" className="home-search__button"><i className="fas fa-arrow-right"></i></button>
            </form>
        );
    }
}