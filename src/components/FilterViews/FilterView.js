import React from 'react';
import LoadingView from '../LoadingView/LoadingView';
import Title from './subComponents/Title';
import ArticleSection from './subComponents/ArticleSection';
import makeCancelable from '../../PromiseHelp';
import './FilterView.css';

export default class SearchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fade: 'in',
            loading: true,
            data: {},
        }
    }

    //holds promise so it can be canceled when unmounted
    cancelablePromise = null;
    cancelablePromiseAll = null;

    componentDidMount() {
        const url = `https://swapi.co/api${this.props.match.url}`
        this.makeFetchRequest(url);
    }

    componentWillUnmount() {
        this.cancelablePromise.cancel();
        this.cancelablePromiseAll.cancel();
    }

    //makes sure the data is updated before attempting to render!
    updateData = (data) => {
        this.setState({data}, () => { this.setState({loading: false})});
    }

    checkFsafNames = (arr, dataToCheckAgainst) => {
        arr.forEach((fsafName, index) => { 
            if (!dataToCheckAgainst[fsafName]) {
                arr.splice(index, 1);
            }
        })
        return arr;
    }

    makeFetchRequest = (url) => {
        const options = {
            method: 'GET',
            headers: {
            'content-type': 'application/json'
            }
        };
        this.cancelablePromise = makeCancelable(fetch(url, options))
        this.cancelablePromise
            .promise
            .then(response => {
                if (!response.ok) {
                    return response.json().then(e => Promise.reject(e));
                }
                return response.json();
            })
            .then(respJson => {
                //if multiple GET requests are needed.
                this.handleMultipleFetchRequests(respJson, options);
            })
            .catch(error => {
                console.log(error);
            });
    }

    getSliceIndexes = (lengths, index) => {
        const startIndex = (index === 0 ? 0 : lengths.slice(0,index).reduce((total, num) => total + num));
        const endIndex = lengths.slice(0,index+1).reduce((total, num) => total + num);
        return [startIndex, endIndex];
    }

    handleMultipleFetchRequests = (respJson, options) => {
        let filterSpecificAdditionalFetches = this.getFilterSpecificAdditionalFetches();
        filterSpecificAdditionalFetches = this.checkFsafNames(filterSpecificAdditionalFetches, respJson);
        const lengths = filterSpecificAdditionalFetches.map(fsafName => (typeof(respJson[fsafName]) === 'string' ? 1 : respJson[fsafName].length));
        let promises = [];
        filterSpecificAdditionalFetches.forEach((fsafName,index) => {
            if (lengths[index] > 0) {
                if (typeof(respJson[fsafName]) === 'string') {
                    promises.push(respJson[fsafName]);
                } else {
                    respJson[fsafName].forEach(n => { promises.push(n) });
                }
            }
        })
        if (promises.length > 0) {
            this.cancelablePromiseAll = makeCancelable(this.getAllFetchPages(promises, options, respJson))
            this.cancelablePromiseAll
                .promise
                .then(respAllJson => { 
                    filterSpecificAdditionalFetches.forEach((fsafName, index) => {
                        respJson[fsafName] = respAllJson.slice(...this.getSliceIndexes(lengths,index));
                    })
                    this.updateData(respJson) 
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            this.updateData(respJson);
        }
    }

    getAllFetchPages = (urls, options, respJson) => {
        const promises = [];
        for (let i = 0; i < (urls.length); i++) {
            const pageUrl = urls[i];
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
                return respAllJson.map(resp => {
                    const title = resp.title || resp.name;
                    const url = resp.url;
                    return { title, url }
                });
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    getProperUrl = (url) => {
        return url.replace('https://swapi.co/api', '');
    }

    handleLinkClick = (event, url) => {
        event.preventDefault();
        this.setState({fade: 'out'}, () => setTimeout(() => { this.props.history.push(url) }, 500));
    }

    //Get specifics to each filter
    getPath = () => {
        return this.props.match.path;
    }

    getFilterSpecificAdditionalFetches = () => {
        const path = this.getPath();
        if (path === '/starships/:shipId') {
            return ['films', 'pilots'];
        } else if (path === '/people/:peopleId') {
            return ['films',  'homeworld', 'species', 'starships', 'vehicles'];
        } else if (path === '/films/:filmId') {
            return ['characters', 'planets', 'species', 'starships', 'vehicles'];
        } else if (path === '/planets/:planetId') {
            return ['films', 'residents'];
        } else if (path === '/vehicles/:vehicleId') {
            return ['films'];
        } else if (path === '/species/:speciesId') {
            return ['homeworld', 'people', 'films'];
        }
    }

    getDescriptionText = () => {
        const path = this.getPath();
        if (path === '/starships/:shipId') {
            return this.getShipDescriptionText();
        } else if (path === '/people/:peopleId') {
            return this.getPeopleDescriptionText();
        } else if (path === '/films/:filmId') {
            return this.getFilmDescriptionText();
        } else if (path === '/planets/:planetId') {
            return this.getPlanetDescriptionText();
        } else if (path === '/vehicles/:vehicleId') {
            return this.getVehicleDescriptionText();
        } else if (path === '/species/:speciesId') {
            return this.getSpeciesDescriptionText();
        }
    }

    getShipDescriptionText = () => {
        const data = this.state.data;
        return (
            [
                `At a length of ${parseInt(data.length).toLocaleString()} meters long, the ${data.name} is classified as a ${data.starship_class.toLowerCase()}. In addition, the ${data.name} was manufactured by the ${data.manufacturer}
                at a cost of ${parseInt(data.cost_in_credits).toLocaleString()} galactic credits.`,

                `The maximum Megalights this starship can travel per standard hour is ${data.MGLT} with a hyperdrive rating of ${data.hyperdrive_rating}.
                ${data.max_atmosphering_speed !== 'n/a' ? 'In the atmosphere the maximum speed of the '+data.name+' is '+parseInt(data.max_atmosphering_speed).toLocaleString()+'.' : ''}`,

                `The ${data.name} takes a crew of ${parseInt(data.crew).toLocaleString()}${data.passengers > 0 ? ', with room for up to '+parseInt(data.passengers).toLocaleString()+' passengers.' : '.'}
                To accomdate ${data.passengers > 0 ? 'both crew and passengers' : 'the crew'} the ${data.name} can hold up to ${data.consumables} worth of consumables and has a cargo capacity of ${parseInt(data.cargo_capacity).toLocaleString()} kilograms.`
            ]
        );
    }

    getPeopleDescriptionText = () => {
        const data = this.state.data;
        const vowels = 'aeiou';

        
        const pronoun = data.gender === "female" ? 'She' : 'He';



        const species = data.species[0] && (vowels.indexOf(data.species[0]) !== -1 ? 'an' : 'a')+' '+data.species[0].title.toLowerCase();
        const gender = data.gender !== 'none' ? data.gender : '';
        const speciesString = `${species ? species+' '+gender: 'a '+gender+' of an unknown species'}`;

        const planetString = data.homeworld[0].title === 'unknown' ? 'from an unknown planet' : 'from the planet '+data.homeworld[0].title;

        const hairString = data.hair_color !== 'unknown' ? (data.hair_color !== 'none' ? data.hair_color.toLowerCase()+' hair with' : 'no hair,') : 'an unknown hair color,';
        const eyeString = data.eye_color !== 'unknown' ? (data.eye_color !== 'none' ? data.eye_color.toLowerCase()+' eyes ' : 'no eyes,') : 'an unknown eye color,';
        const skinString = data.skin_color !== 'unknown' ? (data.skin_color !== 'none' ? data.skin_color.toLowerCase()+' skin' : 'no skin') : 'an unknown skin color';
        
        const heightString = data.height !== 'unknown' ? 'a height of '+this.convertCmToFeetAndInches(data.height) : 'an unknown height';
        const weightString = data.mass !== 'unknown' ? 'and weighs '+Math.floor(data.mass*22.04623)/10+' lbs' : 'and an unknown weight';

        const birthYearString = data.birth_year !== 'unknown' ? 'in '+data.birth_year : 'on an unknown year';
        return (
            [
                `${data.name} is ${speciesString} ${planetString}. ${data.name} has ${hairString} ${eyeString}
                and ${skinString}. ${pronoun} has ${heightString} ${weightString}.`,
                `${data.name} was born ${birthYearString}.`
            ]
        )
    }

    getFilmDescriptionText = () => {
        const data = this.state.data;
        const fullName = 'Star Wars '+this.convertNumToRomanNumerals(this.state.data.episode_id)+': '+data.title;
        const releaseDate = this.releaseDateToString(data.release_date);
        return (
            [
                `${fullName}, directed by ${data.director}, produced by ${data.producer}, was released on ${releaseDate}.`,
                data.opening_crawl,
            ]
        )
    }

    getPlanetDescriptionText = () => {
        const data = this.state.data;
        const vowels = 'aeiou';
        const populationString = data.population !== 'unknown' ? 'supports a population of '+parseInt(data.population).toLocaleString() : 'has an unknown population';

        const waterString = data.surface_water !== 'unknown' ? `with the percentage of water covering the surface at ${data.surface_water}%` : 'with an unknown percentage of water covering the planet';
        const terrainString = 'The terrain is '+data.terrain.toLowerCase()+' '+waterString;


        let secondParagraph = '';
        const diamaterString = data.diameter !== '0' ? `${data.name} has a diameter of ${parseInt(data.diameter).toLocaleString()} kilometers. ` : '';
        const rot_period = data.rotation_period !== '0' ? `The planet has a rotational period of ${parseInt(data.rotation_period).toLocaleString()} standard hours, and ` : '';
        const orb_period = data.orbital_period !== '0' ? `an orbital period of ${parseInt(data.orbital_period).toLocaleString()} standard hours. ` : '';
        const gravity = data.gravity !== '0' ? `The gravity of the planet is ${data.gravity} G${parseInt(data.gravity) !== 1 ? 's' : ''}.` : '';
        secondParagraph += diamaterString + rot_period + orb_period + gravity;
        const subStrings = [
            `${data.name} has a${vowels.indexOf(data.climate[0]) !== -1 ? 'n' : ''} ${data.climate.toLowerCase()} climate. ${terrainString}. ${data.name} ${populationString}.`,
            (secondParagraph && secondParagraph)
        ];
        const fullString = data.name !== 'unknown' ? subStrings : ['Although not a planet with the name "Unknown", this instead is a grouping for those whose homeplanet is unknown.']; 

        return (
            fullString
        )
    }

    getVehicleDescriptionText = () => {
        const data = this.state.data;
        const costString = data.cost_in_credits !== 'unknown' ? `a cost of ${parseInt(data.cost_in_credits).toLocaleString()} galactic credits` : 'an unknown cost';
        const vowels = 'aeiou';
        return (
            [
                `At a length of ${parseInt(data.length).toLocaleString()} meters long, the ${data.name} is classified as ${vowels.indexOf(data.vehicle_class[0]) !== -1 ? 'an' : 'a'} ${data.vehicle_class.toLowerCase()} vehicle. In addition, the ${data.name} was manufactured by the ${data.manufacturer}
                at ${costString}.`,

                `The maximum atmosphering speed this vehicle can travel per standard hour is ${data.max_atmosphering_speed}.`,

                `The ${data.name} takes a crew of ${parseInt(data.crew).toLocaleString()}${data.passengers > 0 ? ', with room for up to '+parseInt(data.passengers).toLocaleString()+' passengers.' : '.'}
                To accomdate ${data.passengers > 0 ? 'both crew and passengers' : 'the crew'} the ${data.name} can hold up to ${data.consumables} worth of consumables and has a cargo capacity of ${parseInt(data.cargo_capacity).toLocaleString()} kilograms.`
            ]
        )
    }

    getSpeciesDescriptionText = () => {
        const data = this.state.data;
        const hairString = data.hair_colors === 'n/a' || data.hair_colors === 'none' ? 'have no hair' : `have hair colors of ${data.hair_colors}`;
        const eyeString = data.eye_colors === 'n/a' || data.eye_colors === 'none' ? 'have no set eye colors' : `have eye colors of ${data.eye_colors}`;
        const languageString = data.language === 'n/a' || data.language === 'none' ? 'have no set language' : `typically speak ${data.language}`;
        return (
            [
                `${data.name}s are classified as ${data.classification}s and are considered ${data.designation}.`,
                `The average lifespan of a ${data.name} is ${data.average_lifespan} ${data.average_lifespan !== 'indefinite' ? 'years' : ''}.`,
                `${data.name}${data.name[data.name.length-1] !== 's' ? 's' : ''} ${languageString}.`,
                `${data.name}${data.name[data.name.length-1] !== 's' ? 's' : ''} typically ${hairString} and ${eyeString}.`
            ]
        )
    }

    handleGoBackClick = (event) => {
        event.preventDefault();
        if (this.props.history.length > 0) {
            this.props.history.goBack();
        } else {
            this.props.history.push('/');
        }
    }

    convertCmToFeetAndInches = (cm) =>{
        const heightInFeet = `${cm/30.48}`;
        const decimalIndex = heightInFeet.indexOf('.');
        const feet = heightInFeet.slice(0, decimalIndex);
        const inches = Math.floor(parseFloat('0'+heightInFeet.slice(decimalIndex))*12);
        return `${feet}' ${inches}"`
    }

    convertNumToRomanNumerals = (num) => {
        if (isNaN(num))
            return NaN;
        var digits = String(+num).split(""),
            key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                   "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                   "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return 'Episode '+Array(+digits.join("") + 1).join("M") + roman;
    }

    releaseDateToString = (date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const year = date.slice(0,4);
        const month = months[parseInt(date.slice(5,7))-1];
        const day = date.slice(8);
        return `${month} ${day}, ${year}`
    }

    getDetails = () => {
        const text = this.getDescriptionText();
        let filterSpecificAdditionalFetches = this.getFilterSpecificAdditionalFetches();
        filterSpecificAdditionalFetches = this.checkFsafNames(filterSpecificAdditionalFetches, this.state.data);
        const additionalArticleSections = filterSpecificAdditionalFetches.map((fsafName, index) => {
            return this.state.data[fsafName].length > 0 ? <ArticleSection key={index} title={fsafName} text={this.state.data[fsafName]} getProperUrl={this.getProperUrl} handleLinkClick={this.handleLinkClick} /> : '';
        })
        //if vehicle/ship grab the model, otherwise nil, if film grab the episode id and convert it to roman numerals
        const subTitle = this.state.data.model || this.convertNumToRomanNumerals(this.state.data.episode_id) || '';
        return (
            <article className={`transition__fade-${this.state.fade}`}>
                <Title title={this.state.data.name || this.state.data.title} subTitle={subTitle} created={this.state.data.created} edited={this.state.data.edited} />
                <ArticleSection title="Description" text={text} />
                {additionalArticleSections}
                <button className="filter-view__go-back-link go-back-link" onClick={(e) => this.handleGoBackClick(e)}><i className="fas fa-angle-left"></i> Go back</button>
            </article>
        );
    }

    render() {
        return (
            <>
                {this.state.loading ? <LoadingView /> : this.getDetails()}
            </>
        );
    }
}