import React from 'react';
import { Link } from 'react-router-dom';

export default function SearchResult(props) {
    const url = props.getProperUrl(props.itemData.url)
    return (
        <li className="search-result__item">
            <Link to={url} onClick={e => props.handleLinkClick(e, url)}>{props.itemData.name || props.itemData.title}</Link>
        </li>
    );
}