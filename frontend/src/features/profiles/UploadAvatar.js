import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../auth/authSlice";
import {
  Form,
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { useNewProfPicMutation } from "../users/usersApiSlice";

const UploadAvatar = ({
  userId,
  token,
  username,
  avatarUrl,
  setisUserUpdated,
}) => {
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [newProfPic, { isLoading, error }] = useNewProfPicMutation();
  const userName = useSelector(selectCurrentUser);
  console.assert(userName !== null, "%o", "User can't be null in UploadAvatar")
  console.log("user:", userName)


  const toggle = () => {
    setModal(!modal);
  };

  const handleFileChange = ({ target: { files } }) => {
    if (files?.length) {
      console.log("files", files);
      const { type } = files[0];
      if (type === "image/png" || type === "image/jpeg") {
        setFile(files[0]);
      } else {
        toast.error("Only png and jpeg image types are allowed*", {
          hideProgressBar: true,
        });
      }
    }
  };

  const updateUserAvatarId = async (avatarId, avatarUrl) => {
    try {
      await axios.put(
        `http://localhost:1337/api/users/${userId}`,
        { avatarId, avatarUrl },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${token}`,
          },
        }
      );
      setisUserUpdated(true);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("File is required*", {
        hideProgressBar: true,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file); // Append the file (key should match backend expectation)
      // formData.append('name', userName); // Append additional fields

      const result = await newProfPic({ userName, formData });
      // updateUserAvatarId(id, url);
      setFile(null);
      setModal(false);
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div>
      <Button size="sm" onClick={toggle}>
        {`${avatarUrl ? "Change" : "Upload"} picture`}
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{`${avatarUrl ? "Change" : "Upload"
          } your avatar`}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="exampleFile">File</Label>
              <Input
                type="file"
                name="file"
                id="exampleFile"
                onChange={handleFileChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>
            Upload
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UploadAvatar;