/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'

import { Col, Container, Navbar, Row, Pagination } from 'react-bootstrap'
import Avatar from 'react-avatar'
import { AuthAPI } from '../../api/auth-api'
import { HttpStatus } from '../../api/default'
import CardCourses from '../../components/CardCourses'
import { Link } from 'react-router-dom'
import "./index.css"

const NotFound = () => (
    <h1>Nenhum curso cadastrado por este professor !</h1>
)

const ProfessorCoursesPage = () => {
    const [userData, setUserData] = useState({ name: "" });
    const [data, setData] = useState({})
    const [isFetched, setIsFetched] = useState(false)
    const [activePage, setActivePage] = useState(1);
    const [amountPages, setAmountPages] = useState(6)

    const pageSize = 6;

    const renderPagination = () => {
        let items = []
        for(let i = 1; i <= amountPages; i++){
            if(!isFetched){
                items.push(
                    <Pagination.Item key={i} active={i === activePage} disabled onClick={() => setActivePage(i)}>{i}</Pagination.Item>
                )
            }else {
                items.push(
                    <Pagination.Item key={i} active={i === activePage} onClick={() => setActivePage(i)}>{i}</Pagination.Item>
                )
            }
        }

        return (
            <div>
                <Pagination>
                    {amountPages > 1 && (
                        <>
                        {isFetched ? 
                            <Pagination.Prev onClick={() => activePage > 1 && setActivePage((prevState) => prevState - 1)}/>
                            : <Pagination.Prev disabled onClick={() => activePage > 1 && setActivePage((prevState) => prevState - 1)}/>
                        }
                        {items}
                        {isFetched ? <Pagination.Next onClick={() => activePage < 3 && setActivePage((prevState) => prevState + 1)}/>
                        : <Pagination.Next disabled onClick={() => activePage < 3 && setActivePage((prevState) => prevState + 1)}/>}
                        </>
                    )}
                </Pagination>
            </div>
        )
    }

    useEffect(() => {
        const userData = localStorage.getItem('userData')
        if (userData != null)
            setUserData(JSON.parse(userData))
    }, [])

    useEffect(() => {
        const getProfessorCourses = async () => {
            setIsFetched(false)
            try {
                const {id} = userData;
                const responseCourses = await AuthAPI.getProfessorCourses(id, activePage, pageSize)
                if (responseCourses.status === HttpStatus.OK) {
                    setData(responseCourses.data)
                    console.log(responseCourses.data)
                    const pages = Math.ceil(responseCourses.data.count / pageSize)
                    setAmountPages(pages)
                    setIsFetched(true)
                }
            } catch(err){
                console.log(err)
            }
        }

        getProfessorCourses();
    }, [userData, activePage, pageSize])

    return (
        <>
            <Navbar style={{ marginBottom: '50px' }}>
                <Container fluid>
                <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                    &#128075;&nbsp; Hey, {JSON.parse(localStorage.getItem('userData')).name.split(' ')[0]}!
                </p>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                    <Avatar
                        class
                        name="Christofer"
                        color="#0f5b7a"
                        size={30}
                        textSizeRatio={2}
                        round={true}
                    />
                    </Navbar.Text>
                </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="col home-card mt-5">
                <h1 className="mt-3 mb-3 fs-5 fw-bold">Meus cursos</h1>
                {isFetched ? (
                    <Row className="g-4">
                        {data.results.map((course) => (
                            <Col xs={12} lg={4} key={course.id}>
                                <Link to={`/professor/courses/edit/${course.id}`}>
                                    <CardCourses teste={course} />
                                </Link>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <p>Carregando</p>
                )}
            </div>
            <Row className='mt-5'>
                <Col className='d-flex justify-content-center'>
                    {renderPagination()}
                </Col>
            </Row>
        </>
    )
}

export default ProfessorCoursesPage;