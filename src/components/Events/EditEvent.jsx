import { Link, useNavigate } from "react-router-dom";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient, updateEvent } from "../../util/http.js";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

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
    mutationKey: ["event", "edit-event"],
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const previousEvent = queryClient.getQueriesData(["events", id]);
      queryClient.setQueryData(["events", id], data.event);
      return { previousEvent };
    },
    onError: (error, variables, context)=> {
      queryClient.setQueryData(["events", id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["events", id]});
    }
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate("..");
  }

  function handleClose() {
    navigate("..");
  }

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={event} onSubmit={handleSubmit}>
        <Link to=".." className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
