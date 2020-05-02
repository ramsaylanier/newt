import {
  Box,
  ButtonGroup,
  IconButton,
  Textarea,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/core";

export default function ContentBlock({ block }) {
  const [value, setValue] = React.useState(block.title);

  return (
    <Box display="flex">
      <InputGroup width="100%">
        <Textarea value={value} backgroundColor="gray.100" mb="1" pr="2rem" />
        <InputRightElement width="2rem">
          <ButtonGroup>
            <IconButton icon="add" />
            <IconButton icon="close" />
          </ButtonGroup>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}
