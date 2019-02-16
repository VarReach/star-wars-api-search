import React from 'react';

export default class NotFoundPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <section className="not-found-page">
                <h2>Page not found.</h2>
                <p>Go back to the <a href="/">Home Page</a>?</p>
            </section>
        )
    }
}