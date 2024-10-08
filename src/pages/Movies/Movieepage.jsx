import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { Container, Row, Col, Button } from 'react-bootstrap';
import MovieCard from '../../common/MovieCard/MovieCard';
import ReactPaginate from 'react-paginate';
import SyncLoader from 'react-spinners/SyncLoader';
import { useSearchMovieQuery } from '../../hooks/useSearchMovie';
import { useMovieGenreQuery } from '../../hooks/useMovieGenre';
import CustomDropdown from '../../common/CustomDropdown/CustomDropdown';
import "./Moviepage.css";

const Moviepage = () => {
    const [query, setQuery] = useSearchParams();
    const navigate = useNavigate();

    const [sortOption, setSortOption] = useState('popularity.desc');
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const pageFromUrl = parseInt(query.get("p") || "1");
    const [page, setPage] = useState(pageFromUrl);
    const keyword = query.get("q");
    const genre = query.get("g");

    const { data: genreData } = useMovieGenreQuery();
    const { data: movieData, isLoading, isError, error } = useSearchMovieQuery({ keyword, genre, page, sortOption });

    const sortMovies = (movies, sortOption) => {
        switch (sortOption) {
            case 'popularity.desc':
                return movies.sort((a, b) => b.popularity - a.popularity);
            case 'popularity.asc':
                return movies.sort((a, b) => a.popularity - b.popularity);
            case 'vote_average.desc':
                return movies.sort((a, b) => b.vote_average - a.vote_average);
            case 'vote_average.asc':
                return movies.sort((a, b) => a.vote_average - b.vote_average);
            default:
                return movies;
        }
    };

    useEffect(() => {
        setPage(pageFromUrl); 
    }, [pageFromUrl]);

    useEffect(() => {
        if (movieData) {
            const sortedMovies = sortMovies(movieData.results, sortOption);
            setSelectedMovies(sortedMovies);
        }
    }, [movieData, sortOption]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePageClick = ({ selected }) => {
        const newPage = selected + 1;
        setPage(newPage);
        setQuery(prev => {
            const params = new URLSearchParams(prev);
            params.set("p", newPage);
            return params;
        });
    };

    const showMoviesByGenre = (genreId) => {
        setQuery({ g: genreId, page: 1 }); 
        setSortOption('popularity.desc');
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <SyncLoader color="#f92828" margin={5} size={15} />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant='danger'>Error fetching movies: {error.message}</Alert>
        );
    }

    const sortOptions = [
        { value: 'popularity.desc', label: '인기 (내림차순)' },
        { value: 'popularity.asc', label: '인기 (오름차순)' },
        { value: 'vote_average.desc', label: '평점 (내림차순)' },
        { value: 'vote_average.asc', label: '평점 (오름차순)' }
    ];

    return (
        <div>
            <Container className='container moviepage'>
                <Row>
                    <Col lg={4} xs={12}>
                        <div className="sorting-filter">
                            <label htmlFor="sort-by">Sort by</label>
                            <CustomDropdown
                                options={sortOptions}
                                value={sortOption}
                                onChange={setSortOption}
                            />
                        </div>
                        <div className="genre-filter">
                            {genreData?.map((genre) => (
                                <Button
                                    key={genre.id}
                                    variant={genre === genre.id ? "danger" : "outline-danger"}
                                    className="me-3"
                                    onClick={() => showMoviesByGenre(genre.id)}
                                >
                                    {genre.name}
                                </Button>
                            ))}
                        </div>
                    </Col>

                    <Col lg={8} xs={12}>
                        <Row>
                            {movieData?.results.length > 0 ? (
                                movieData.results.map((movie, index) => (
                                    <Col key={index} lg={4} xs={12}>
                                        <MovieCard movie={movie} />
                                    </Col>
                                ))
                            ) : (
                                <Alert className="custom-alert">
                                    {keyword ? `No results found for "${keyword}".` : "No movies found."}
                                </Alert>
                            )}
                        </Row>
                    </Col>
                </Row>
                {movieData?.results.length > 0 && (
                    <div className="pagination-container">
                        <ReactPaginate
                            previousLabel={isMobile ? "<" : "Previous"}
                            nextLabel={isMobile ? ">" : "Next"}
                            pageClassName="page-item"
                            pageLinkClassName="page-link"
                            previousClassName="page-item"
                            previousLinkClassName="page-link"
                            nextClassName="page-item"
                            nextLinkClassName="page-link"
                            breakLabel="..."
                            breakClassName="page-item"
                            breakLinkClassName="page-link"
                            pageCount={movieData?.total_pages}
                            marginPagesDisplayed={isMobile ? 1 : 2}
                            pageRangeDisplayed={isMobile ? 3 : 5}
                            onPageChange={handlePageClick}
                            containerClassName="pagination"
                            activeClassName="active"
                            forcePage={page - 1}  
                        />
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Moviepage;
