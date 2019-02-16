import React from 'react';

export default function Title(props) {
    return (
        <section className="filter-view__header">
            <h2>{props.title}</h2>
            <p className="filter-view__model">{props.subTitle}</p>
            <p className="filter-view__dates">{'File created: '+props.created}<br/>{'File last edited: '+props.edited}</p>
        </section>
    );
}