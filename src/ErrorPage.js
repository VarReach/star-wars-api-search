import React from 'react';

export default class ErrorPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        }
    }

    static getDerivedStateFromError(error) {
        return { error: true };
    }

    render() {
        if (this.state.error) {
            return (
                <section className="error-page">
                    <h2>Something has gone wrong.</h2>
                    <p>Go back to the <a href="/">Home Page</a>?</p>
                </section>
            )
        }
        return this.props.children;
    }
}