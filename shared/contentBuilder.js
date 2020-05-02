import { ButtonGroup, Modal, IconButton, useDisclosure } from "@chakra-ui/core";
import PageFinder from "./pageFinder";
import { uuid } from "uuidv4";

export default function ContentBuilder({ blocks, setBlocks }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleAdd = () => {
    const id = uuid();
    const newBlocks = new Map(blocks);
    newBlocks.set(id, { content: "" });
    setBlocks(newBlocks);
  };

  return (
    <React.Fragment>
      <ButtonGroup backgroundColor="green.200" p="2">
        <IconButton icon="add" size="sm" onClick={handleAdd} />
        <IconButton icon="link" size="sm" onClick={onOpen} />
      </ButtonGroup>

      <PageFinder isOpen={isOpen} onClose={onClose} />
    </React.Fragment>
  );
}
