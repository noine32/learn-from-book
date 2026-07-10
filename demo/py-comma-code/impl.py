def comma_code(items):
    if not items:
        return ""
    if len(items) == 1:
        return str(items[0])
    return ", ".join(str(x) for x in items[:-1]) + ", and " + str(items[-1])
