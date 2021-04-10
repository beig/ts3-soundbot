package se.wastedtime.ts3.data;

import lombok.Value;

import java.util.List;

@Value
public class JsonCategoryWrapper {
    List<Category> categories;
}
