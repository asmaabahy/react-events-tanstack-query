import { Link, Outlet, useParams, useNavigate } from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../util/http.js";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id], //so we dont have same cached data for all events, but instead each id its own cached data
    queryFn: ({ signal }) => fetchEvent({ id: id, signal }),
  });

  const { mutate } = useMutation({
    mutationKey: ["delete-event"],
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });      
      navigate("../");
    },
  });

  function handleDelete() {
    mutate({ id: id });
    console.log('helloo');
    
  }

  /*

date : "2024-05-21"
description : "An empowering event dedicated to women who are passionate about web development. Connect, share, and inspire."
id : "e3"
image : "women-coding.jpg"
location : "Empowerment Hall, Seattle, WA"
time : "16:30"
title : "Women in Web Development Mixer!"

*/

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isPending && (
          <div className="center">
            <LoadingIndicator />
          </div>
        )}
        {event && (
          <>
            <header>
              <h1>{event.title}</h1>
              <nav>
                <button onClick={handleDelete}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={"http://localhost:3000/" + event.image}
                alt={event.image}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{event.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {event.date} @ {event.time}
                  </time>
                </div>
                <p id="event-details-description">{event.description}</p>
              </div>
            </div>
          </>
        )}
        {isError && (
          <div className="center">
            <ErrorBlock
              title="An error occurred"
              message={error.info?.message || "Failed to create event"}
            />
          </div>
        )}
      </article>
    </>
  );
}
