import React from 'react';
import { Link } from 'react-router-dom';

export default function Description(props) {
    const getTextFromArray = () => {
        return props.text.map((data,index) => {
            if (typeof(data) === 'string') {
                return <p key={index}>{data}</p>
            } else {
                const url = props.getProperUrl(data.url);
                return (
                    <li key={index}>
                        <Link to={url} onClick={e => props.handleLinkClick(e, url)}>{data.title}</Link>
                    </li>
                );
            }
        });

    }

    return (
        <section className="filter-view__section">
            <h3>{props.title}</h3>
            <ul >
                {getTextFromArray()}
            </ul>
        </section>
    );
}