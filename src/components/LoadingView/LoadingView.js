import React from 'react';
import './LoadingView.css';

export default function LoadingView() {
    return (
        <div className="sk-folding-cube transition__fade-in">
            <div className="sk-cube1 sk-cube"></div>
            <div className="sk-cube2 sk-cube"></div>
            <div className="sk-cube4 sk-cube"></div>
            <div className="sk-cube3 sk-cube"></div>
        </div>
    );
}