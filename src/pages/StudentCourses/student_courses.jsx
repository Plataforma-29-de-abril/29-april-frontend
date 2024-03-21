/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Pagination } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { AuthAPI } from '../../api/auth-api'
import { HttpStatus } from '../../api/default'
import CardCourses from '../../components/CardCourses'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointLeft } from '@fortawesome/free-solid-svg-icons'
import { useAuthContext } from '../../contexts/AuthContext'
import Navbar from 'react-bootstrap/Navbar'
import Avatar from 'react-avatar'

const StudentCoursesPage = () => {
    const [userData, setUserData] = useState({ name: "" });
    const [data, setData] = useState({});
    const [isFetched, setIsFetched] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [amountPages, setAmountPages] = useState(6);
    const { logged, user } = useAuthContext();

    const navigate = useNavigate();

    const pageSize = 6;

    const renderPagination = () => {
        let items = []
        for (let i = 1; i <= amountPages; i++) {
            if (!isFetched) {
                items.push(
                    <Pagination.Item key={i} active={i === activePage} disabled onClick={() => setActivePage(i)}>{i}</Pagination.Item>
                )
            } else {
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
                                <Pagination.Prev onClick={() => activePage > 1 && setActivePage((prevState) => prevState - 1)} />
                                : <Pagination.Prev disabled onClick={() => activePage > 1 && setActivePage((prevState) => prevState - 1)} />
                            }
                            {items}
                            {isFetched ? <Pagination.Next onClick={() => activePage < amountPages && setActivePage((prevState) => prevState + 1)} />
                                : <Pagination.Next disabled onClick={() => activePage < amountPages && setActivePage((prevState) => prevState + 1)} />}
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
        const getStudentCourses = async () => {
            setIsFetched(false)
            try {
                const { id } = userData;
                const responseCourses = await AuthAPI.getStudentCourses(id, activePage, pageSize)
                if (responseCourses.status === HttpStatus.OK) {
                    setData(responseCourses.data)
                    const pages = Math.ceil(responseCourses.data.count / pageSize)
                    setAmountPages(pages)
                    setIsFetched(true)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getStudentCourses();
    }, [userData, activePage, pageSize])

    return (
        <>
        <Container fluid>
        <Col>
        <Navbar>
            {logged && user ? (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; Hey, {user?.name?.split(' ')[0]}!
              </p>
            ) : (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; BEM-VINDO!
              </p>
            )}

            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                {user && user.photo ? <img src={user.photo} style={{ width: '50px', aspectRatio: 1, borderRadius: '50%', objectFit: 'fill', objectPosition: 'center', cursor: 'pointer' }} alt="profile" />
                  : <Avatar
                      name={(user?.name && user?.name.split(' ')[0]) || "O i"}
                      color="#0f5b7a"
                      size={30}
                      textSizeRatio={2}
                      round={true}
                  />}
                {/* {user && (
                  <Avatar
                    name={user.name}
                    color="#0f5b7a"
                    size={30}
                    textSizeRatio={2}
                    round={true}
                  />
                )} */}
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>

            <Row className="home-card mt-5">
                <div className="col">
                    <h1 className="mb-3 fs-5 fw-bold">Meus cursos</h1>

                    {isFetched ? (
                        data.results.length ? (
                            <Row className="g-4">
                                {data.results.map((course) => (
                                    <Col xs={12} lg={4} key={course.id}>
                                        <Link to={`/student/courses/${course.id}`}>
                                            <CardCourses teste={course} />
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Container fluid>
                                <div class="d-flex align-items-center justify-content-center" style={{"height": "350px"}}>
                                    <span><h1>Parece que você ainda não se inscreveu em nenhum curso :&#41;</h1>
                                    <p className='fs-5' style={{ color: "#1dbfb0", cursor:"pointer" }} onClick={() => {navigate('/')}}>Clique aqui para ver nossa lista de cursos <FontAwesomeIcon className='fs-5' style={{color:"yellow"}} icon={faHandPointLeft}/></p></span>
                                </div>
                            </Container>
                        )
                    ) : (
                        <p>Carregando...</p>
                    )}
                </div>
            </Row>
            { isFetched && amountPages > 1 &&
            <Row className='mt-5'>
                <Col className='d-flex justify-content-center'>
                    {renderPagination()}
                </Col>
            </Row>
            }
        </Col>
        </Container>
        </>
    )
}

export default StudentCoursesPage;
