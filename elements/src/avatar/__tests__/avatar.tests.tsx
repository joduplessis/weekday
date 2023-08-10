import { shallow, mount, ReactWrapper } from "enzyme";
import * as React from "react";
import "../../../enzyme.setup";
import { Avatar } from "../index";

function hexToRgb(hex: string): string {
  var result: any = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
  ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
  : `rgb(0, 0, 0)`;
}

describe("Renders correctly", () => {
  let el: any;

  beforeEach(() => {
    el = <Avatar title="Jon Doe" />
  });

  it("renders", () => {
    const wrapper = shallow(el);

    expect(wrapper.contains(el));
  });
});

describe("Dark themed", () => {
  let el: ReactWrapper;
  let component: any;
  const darkBackgroundHEX: string = "#222129";
  const darkBackgroundRGB: string = hexToRgb(darkBackgroundHEX);

  beforeEach(() => {
    component = <Avatar
      title="Jon Doe"
      dark={true}
    />
    el = mount(component);
  });

  it("to have a dark background", () => {
    const node: any = el.find('div').at(1).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundColor = style['background-color'];
    
    expect(backgroundColor).toBe(darkBackgroundRGB);
  });
});

describe("Outline inner/outer color & text color", () => {
  let el: ReactWrapper;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        outlineInnerColor="red"
        outlineOuterColor="white"
        textColor="red"
      />
    );
    el = mount(component)
  });

  it("has a class called 'outline'", () => {
    expect(el.find('div').at(1).hasClass('outline')).toBeTruthy();
  });
});

describe("With muted graphic", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        textColor="red"
        size="large"
        muted={true}
        image="https://randomuser.me/api/portraits/men/62.jpg"
      />
    );
    el = mount(component)
  });

  it("to have muted SVG element", () => {
    expect(el.find('div').at(0).find('svg').length).toBe(1)
  });
})

describe("Coloring (auto)", () => {
  let el: any;
  let component: any;
  const textColor: string = "#ffcac9";

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        color="#FC1449"
      />
    );
    el = mount(component)
  });

  it("inner text is colored", () => {
    const { color } = el.find('div').at(1).children().at(0).children().at(0).props()
    expect(color).toBe(textColor);
  });
})

describe("With a presence - invisible for other users", () => {
  let el: any;
  let component: any;
  const dotBackgroundColor: string = hexToRgb("#EAEDEF");

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        presence="invisible:user"
        onPresenceClick={() => console.log('Clicked')}
      />
    );
    el = mount(component)
  });

  it("needs to be muted in color", () => {
    const node: any = el.find('div').at(0).children().at(0).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundColor = style['background-color'];
    
    expect(backgroundColor).toBe(dotBackgroundColor);
  });
})

describe("With a presence - online", () => {
  let el: any;
  let component: any;
  const dotBackgroundColor: string = hexToRgb("#36C5AB");

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        presence="online"
      />
    );
    el = mount(component)
  });

  it("needs to be green in color", () => {
    const node: any = el.find('div').at(0).children().at(0).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundColor = style['background-color'];
    
    expect(backgroundColor).toBe(dotBackgroundColor);
  });
})

describe("With a presence - away", () => {
  let el: any;
  let component: any;
  const dotBackgroundColor: string = hexToRgb("#FD9A00");

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        presence="away"
      />
    );
    el = mount(component)
  });

  it("needs to be orange in color", () => {
    const node: any = el.find('div').at(0).children().at(0).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundColor = style['background-color'];
    
    expect(backgroundColor).toBe(dotBackgroundColor);
  });
})

describe("With a presence - busy", () => {
  let el: any;
  let component: any;
  const dotBackgroundColor: string = hexToRgb("#FC1449");

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        presence="busy"
      />
    );
    el = mount(component)
  });

  it("needs to be red in color", () => {
    const node: any = el.find('div').at(0).children().at(0).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundColor = style['background-color'];
    
    expect(backgroundColor).toBe(dotBackgroundColor);
  });
})

describe("With a presence - offline", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        presence="offline"
      />
    );
    el = mount(component)
  });

  it("needs to be transarent in color", () => {
    const { tagName } = el.find('div').at(0).children().at(0).getDOMNode();
    
    // Presence statuses are SPANs
    expect(tagName).toBe("DIV");
  });
});

describe("Large sizing", () => {
  let el: any;
  let component: any;
  const dimension: number = 40;

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        size="large"
      />
    );
    el = mount(component)
  });

  it("has a width & height of 40px", () => {
    const { width, height } = el.find('div').at(0).props();
    
    expect(width).toEqual(dimension);
    expect(height).toEqual(dimension);
  });
})

describe("No image & a click (default)", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        onClick={() => console.log('CLICK')}
        title="Jon Doe"
      />
    );
    el = mount(component)
  });

  it("to contain a click handle", () => {
    const { onClick } = el.find('div').at(1).props()

    expect(onClick).toBeTruthy();
  });
})

describe("With image", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        title="Jon Doe"
        outlineInnerColor="black"
        outlineOuterColor="white"
        size="large"
        image="https://randomuser.me/api/portraits/men/62.jpg"
      />
    );
    el = mount(component)
  });

  it("needs to have an image background", () => {
    const node: any = el.find('div').at(2).getDOMNode();
    const style = window.getComputedStyle(node);
    const backgroundImage = style['background-image'];

    expect(backgroundImage).toBeTruthy();
  });
})

describe("With delete", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        onDeleteClick={() => console.log('CLICK')}
        deleteIcon={<span id="icon" style={{ color: 'white', fontSize: 10 }}>x</span>}
        title="Jon Doe"
        size="large"
      />
    );
    el = mount(component)
  });

  it("needs to be have a delete icon", () => {
    const node: any = el.find('#icon').at(0);
    
    expect(el.contains(node));
  });
})

describe("With edit", () => {
  let el: any;
  let component: any;

  beforeEach(() => {
    component = (
      <Avatar
        onEditClick={() => console.log('CLICK')}
        editIcon={<span id="icon" style={{ color: '#00ABF0', fontSize: 20 }}>✎</span>}
        title="Jon Doe"
        size="large"
      />
    );
    el = mount(component)
  });

  it("needs to be have an edit icon", () => {
    const node: any = el.find('#icon').at(0);
    
    expect(el.contains(node));    
  });
})
